# Asset Refinement Loop — Design Spec

**Date:** 2026-03-31
**Status:** Approved
**Platform:** Integrated into `example_gen` pipeline

## Overview

An iterative refinement tool for generated visual assets. Users compare two versions side-by-side, annotate what they like/dislike using rectangular region selections with green/red markers and text notes, and an LLM interprets the feedback to generate improved versions. The current best ("champion") competes against each new generation ("challenger") in a tournament-style loop until the user is satisfied.

**Starting platform:** Nakkas (SVG generation via Claude), with adapters for all 6 existing platforms.

## Architecture

Three-layer server-mediated architecture. A new Hono-based server replaces the existing `www/server.ts`, serving both the static gallery and the refinement API on `:3333`.

### Layer 1: Browser (Frontend)

Annotation UI, side-by-side comparison view, timeline navigator, and session management. All views follow the existing dark theme with Verdigris brand colors. Vanilla JS, no framework — consistent with existing preview pages.

**Views:**

1. **Sessions List** (`/refine`) — Grid of session cards showing: thumbnail of current champion (or a platform-default placeholder if no versions exist yet), session name, platform badge, version count, last modified. Includes "New Session" button and filters by platform/status (active/finalized).

2. **Refinement View** (`/refine/:sessionId`) — The main workspace:
   - **Main area:** Single image (annotation phase) or side-by-side (comparison phase). During comparison phase, the annotation overlay div is removed from the DOM entirely (not just hidden) to avoid stacking context issues with the comparison layout.
   - **Annotation toolbar:** Green/Red sentiment toggle (keyboard shortcut: `G`/`R` to switch), clear all, undo last region. Toolbar is hidden during comparison phase.
   - **Feedback textarea:** Free-text overall feedback below the image(s)
   - **Timeline strip:** Horizontal row of version thumbnails (240px wide, generated server-side at write time) along the bottom, lazy-loaded (`loading="lazy"` on `<img>` elements). Clickable to inspect full-size via a fullscreen overlay (dynamic carousel built for this view — the static preview page carousels serve as CSS reference only, not reusable code). "Compare to current" and "Reference this" actions on each thumbnail.
   - **Actions:** "Generate Next" (submit annotations), "Pick Winner" (during comparison), "Finalize" (export champion + winning prompt)

3. **Gallery integration** — Existing asset cards in the main gallery get a "Refine" button that creates a session with that asset as v1 and navigates to the refinement view.

**Annotation canvas implementation:** DOM overlay approach — a `position: absolute` transparent div on top of an `<img>` element within a `position: relative` wrapper. Images are displayed with `width: 100%; height: auto` (no `object-fit: contain` with letterboxing) to ensure mouse coordinates map cleanly to percentage-based region coordinates via `getBoundingClientRect()`. Regions are drawn as absolutely-positioned child divs with colored borders and semi-transparent fills.

**Annotation popover interaction:**
- On mouse release after drawing a rectangle, a popover appears anchored to the rectangle (flips direction if near viewport edge)
- Enter key or clicking outside the popover saves the note (empty notes are valid — renders as unlabeled rectangle)
- Escape key cancels and removes the just-drawn rectangle entirely
- The popover contains a text input and a small "x" close button (same as Escape behavior)

**Side-by-side comparison layout:** Each image sits in a container that is 50% of the available workspace width. Images render with `width: 100%; height: auto` (same as annotation phase). Containers are allowed to be different heights if the assets have different aspect ratios — no cropping or letterboxing. Since all comparisons within a session use the same platform and asset type, aspect ratios will match in practice.

**UI states during generation:**
- "Generate Next" button becomes disabled with a spinner
- Progress text from SSE messages displayed inline below the button (e.g., "Calling Claude...", "Rendering screenshot...")
- Image area shows a subtle blur overlay during generation
- On SSE error: inline error message in red below the button with a "Retry" option
- On SSE completion: blur removed, UI transitions to comparison phase with champion vs. new challenger

### Layer 2: Server (Hono on Node.js)

New server replacing `www/server.ts`. Built with **Hono** for routing, body parsing, and SSE support. Serves both static files (gallery, platform preview pages) and the refinement API. The server resolves its data directory relative to the project root (one level up from `www/`), consistent with how the existing `server.ts` computes `ROOT`.

**Key dependencies:**
- `hono` — routing, body parsing, SSE
- `@hono/node-server` — Node.js adapter
- `playwright` — SVG/HTML → PNG rendering (kept alive as a singleton browser instance for the server's lifetime)
- `sharp` — PNG compositing for annotation overlays, thumbnail generation
- `openai` — LLM calls (OpenAI API for vision + text generation)

**Environment variables:**
- `OPENAI_API_KEY` — required
- `OPENAI_MODEL` — optional, defaults to `gpt-4o`. Centralized model selection for all adapters.

**REST API routes:**

- `POST /api/refine/sessions` — Create a new session
  - Body: `{ name: string, platform: string, sourceAsset?: string }`
  - If `sourceAsset` is provided (start from gallery), copies it as v1
  - If omitted (start from scratch), session is created in `"pending"` status with no versions
  - Returns: `Session` object

- `GET /api/refine/sessions` — List all sessions
  - Returns: `Session[]`

- `GET /api/refine/sessions/:id` — Get session details
  - Returns: `Session` with embedded version list

- `PATCH /api/refine/sessions/:id` — Update session metadata
  - Body: `{ name?: string }`
  - Returns: updated `Session`

- `DELETE /api/refine/sessions/:id` — Delete a session and all its files
  - Permanently removes the session directory. No soft-delete or undo.
  - Returns: `{ deleted: true }`

- `POST /api/refine/sessions/:id/generate` — Submit feedback and trigger generation
  - Body: `GenerateRequestBody` (see below)
  - Only one generation per session at a time. Returns `409 Conflict` if a generation is already in progress.
  - Returns immediately: `{ generationId: string }`

- `GET /api/refine/sessions/:id/generate/events` — SSE endpoint for generation progress
  - Streams events: `{ type: "progress", message: string }`, `{ type: "done", version: string }`, `{ type: "error", message: string }`
  - Automatically closes after "done" or "error"

- `POST /api/refine/sessions/:id/pick` — Record winner of a comparison round
  - Body: `{ winner: "champion" | "challenger" }`
  - Returns: updated `Session`

- `POST /api/refine/sessions/:id/finalize` — Export champion asset + prompt to output directory
  - Returns: `{ exportedTo: string }` (path to exported files)

- `GET /api/refine/sessions/:id/versions` — List all versions with metadata
  - Returns: `VersionSummary[]`

- `GET /api/refine/sessions/:id/versions/:v` — Get a specific version's asset/screenshot/prompt
  - Returns: version files (asset, screenshot, prompt) as JSON or binary depending on Accept header

- `POST /api/refine/sessions/:id/annotations` — Save work-in-progress annotations
  - Body: `{ annotations: Annotation[], overallFeedback?: string }`
  - Persists to `annotations/wip.json` so annotations survive page reloads
  - Returns: `{ saved: true }`

**Request body for generation:**

```typescript
interface GenerateRequestBody {
  annotations: Annotation[]
  overallFeedback: string
  referencedVersions?: {
    version: string
    note: string
  }[]
}
```

The server enriches this into the full `GenerateRequest` by loading `currentSource` from the session, compositing the `annotatedScreenshot`, and resolving referenced version sources/renders from disk.

**Responsibilities:**
- Session CRUD (JSON files on disk)
- Screenshot rendering via Playwright (SVG/HTML → PNG). Browser instance launched at server startup, closed on SIGTERM. For animated SVGs, waits 500ms before capture to let animations settle.
- Annotation compositing via Sharp (drawing colored rectangles + text labels onto PNGs)
- Thumbnail generation via Sharp (240px wide) at version write time, synchronous before the SSE "done" event
- Image resizing for LLM input: screenshots are resized to max 1200px wide before base64-encoding for Claude vision input. Keeps token cost manageable (~1500 tokens per image) while retaining enough detail for the model to see annotation regions.
- Generation orchestration with SSE progress updates
- API key management (keys stay server-side)

### Layer 3: Generation Adapters

Each platform implements a common adapter interface. Claude is always the interpreter of feedback — the adapter determines what Claude produces.

```typescript
interface Annotation {
  id: string
  x: number       // percentage (0-100) from left
  y: number       // percentage (0-100) from top
  width: number   // percentage of image width
  height: number  // percentage of image height
  sentiment: "positive" | "negative"
  note: string
}

interface ReferencedVersion {
  version: string
  note: string           // e.g. "use the gradient from this one"
  source: string         // prompt/SVG source of the referenced version
  rendered?: Buffer      // rendered PNG (required for raster platforms, optional for vector)
}

interface GenerateRequest {
  currentSource: string        // SVG source, prompt text, etc.
  annotations: Annotation[]    // structured region data
  annotatedScreenshot: Buffer  // PNG with rectangles drawn on it (resized to max 1200px wide)
  overallFeedback: string      // free-text user feedback
  referencedVersions?: ReferencedVersion[]
  onProgress: (message: string) => void  // SSE progress callback
}

interface GenerateResult {
  source: string          // new SVG/HTML/prompt — the reproducible artifact
  rendered?: Buffer       // PNG screenshot — provided by raster adapters, omitted by vector adapters
}

interface GenerationAdapter {
  platform: string
  generate(request: GenerateRequest): Promise<GenerateResult>
}
```

**Rendering split:** Vector/HTML adapters (Nakkas, Claude SVG, Excalidraw, Stitch) return only `source`. The server renders to PNG via Playwright after the adapter returns, then writes `rendered` to disk. Raster adapters (Recraft, fal.ai) return `rendered` directly since their API output IS the raster image. The server detects which case applies based on whether `rendered` is present in the result.

**Adapter progress contract:** Adapters call `onProgress` at these standard stages:
1. `"Preparing prompt..."` — before the OpenAI API call
2. `"Generating with OpenAI..."` — OpenAI API call in flight
3. `"Processing response..."` — parsing OpenAI's response

The server adds its own progress events after the adapter returns:
4. `"Rendering screenshot..."` — Playwright render (vector/HTML adapters only)
5. `"Generating thumbnail..."` — Sharp resize
6. `"Done"` — version written to disk

**Multi-turn conversation for token efficiency:** Adapters maintain a conversation history per session. The system prompt (platform context, design tokens, role definition) is sent once on the first generation. Subsequent rounds send only the new annotations and feedback as user turns, with the previous SVG/output as an assistant turn. This avoids re-sending the full system context on every iteration. The conversation history is stored in memory (not persisted) — it resets if the server restarts, which simply means the next generation re-sends the system prompt.

**Nakkas adapter (first implementation):**
- Sends current SVG source + annotations + annotated screenshot to OpenAI API (with vision via `gpt-4o`)
- OpenAI interprets feedback and returns a revised SVG as text
- No MCP bridging required. The model generates the full SVG directly.
- Server renders the returned SVG to PNG via Playwright

**Future adapters (same interface):**
- **Recraft / fal.ai:** OpenAI rewrites the image generation prompt based on feedback, server calls the respective API. `ReferencedVersion.rendered` is required (sent as vision input) since prompt text alone is lossy for visual references.
- **Claude SVG:** OpenAI directly returns revised SVG. Simplest adapter.
- **Excalidraw:** OpenAI returns Excalidraw JSON scene. Server renders via Playwright loading the Excalidraw web app. `source` is the JSON scene, not SVG.
- **Stitch:** OpenAI returns revised HTML. Server renders via Playwright.

## Annotation System

### Drawing Interaction

- User selects sentiment: green (positive) or red (negative) via toolbar toggle. Keyboard shortcuts: `G` for green, `R` for red.
- Click-and-drag on the image draws a rectangle
- On mouse release, a popover appears for typing a text note (flips direction if near viewport edge). Enter or click-outside saves. Escape cancels and removes the rectangle.
- Regions are deletable after creation (click region to select, press Delete or click "x" button). Resizability deferred to future iteration.
- Coordinates stored as percentages of image dimensions (resolution-independent)

### LLM Integration

The refinement loop uses the **OpenAI API** (`gpt-4o` by default) for interpreting annotations and generating revised assets. The OpenAI SDK is used with the Chat Completions API, including vision support for annotated screenshots.

**OpenAI message format:** System message sets platform context, user messages contain the annotations + source + screenshot as a multi-part content array (text + `image_url` with base64 data URI).

### Annotation Compositing (Server-Side)

For each generation request, the server composites annotation rectangles onto a screenshot of the asset to produce `vN-annotated.png`:

- **Rectangle style:** 3px border (green `#22c55e` / red `#ef4444`) with semi-transparent fill (same color at 20% opacity). Semi-transparent fill ensures regions are visible to the vision model without fully obscuring the underlying content.
- **Label rendering:** Text note rendered in 14px white text with dark background pill, positioned above the rectangle. If the rectangle is near the top edge, label renders below instead. Empty notes render as unlabeled rectangles (border + fill only, no label).
- **Compositing library:** Sharp — construct an SVG overlay string with `<rect>` and `<text>` elements, composite onto the PNG via `sharp.composite()`.
- **Resize for LLM:** The composited image is resized to max 1200px wide before being passed to the adapter. Full-resolution version is also saved to disk for human review.

### What Gets Sent to the LLM

For each generation request, the LLM receives:

1. **Structured annotation data** — Array of annotation objects with percentage coordinates, sentiment, and notes. This is the authoritative data — the LLM should act on these coordinates.
2. **Annotated screenshot** — Server-composited PNG (resized to max 1200px wide) showing the asset with colored rectangles + labels drawn on it. This is confirmatory visual context — helps the LLM understand the visual intent of each annotation.
3. **Asset source** — The underlying prompt/instruction that produced the current version
4. **Overall text feedback** — Free-text field for general comments
5. **Referenced past versions** (optional) — Source/prompt from past versions the user pointed to, with notes. For raster platforms, also includes the rendered PNG as a vision input.

**LLM prompt structure (system prompt, sent once per session):**
```
You are a visual asset refinement assistant for Verdigris, an energy analytics company.
You refine [platform] assets based on user annotations and feedback.

Design context:
- Brand colors: verdigris teal (#0fc8c3), midnight purple, cyber yellow
- Typography: Lato for headlines, Inter for body
- Style: professional, clean, data-forward

Rules:
- Use the structured annotation data (coordinates + sentiment + notes) as your primary guide
- Use the annotated screenshot as visual confirmation of what each region looks like
- Preserve elements in green-annotated regions
- Address issues in red-annotated regions
- Return the complete [SVG/prompt] source — no partial updates
```

**Per-round user message:**
```
Current source:
[SVG/prompt text]

Annotations:
[JSON array of {x, y, width, height, sentiment, note}]

Overall feedback: [user's free text]

[If referenced versions exist:]
Reference from version [N]: "[user's note]"
[Referenced version source included]

Generate an improved version.
```

## Comparison & Tournament Flow

### Side-by-Side View

- Champion on the left ("Current Champion v3"), challenger on the right ("Challenger v4")
- Each image in a 50%-width container with `width: 100%; height: auto`. Containers may differ in height if aspect ratios differ (unlikely within same platform/asset type, but handled gracefully).
- Below each: a "Pick This One" button
- Between them: a "They're Equal" option — keeps the existing champion (no change), records the round as `winner: "tie"` in history

### After Picking a Winner

- Winner becomes the new champion (or champion is retained on "They're Equal")
- Decision recorded in `history.json`:
  ```json
  {
    "round": 3,
    "champion": "v3",
    "challenger": "v4",
    "winner": "v4",
    "annotationsUsed": "v3-annotations.json",
    "overallFeedback": "better color balance, less visual clutter",
    "timestamp": "2026-03-31T14:30:00Z"
  }
  ```
  The `overallFeedback` and `annotationsUsed` fields come from the feedback that produced the challenger — no separate "why" prompt needed during the pick step.
- UI transitions to annotation phase: champion shown solo, ready for new feedback

### History Schema

```typescript
interface HistoryEntry {
  round: number
  champion: string           // version id, e.g. "v3"
  challenger: string         // version id, e.g. "v4"
  winner: string             // "v3" | "v4" | "tie"
  annotationsUsed: string    // filename in annotations/ dir
  overallFeedback: string    // the feedback that produced the challenger
  timestamp: string          // ISO 8601
}
```

`history.json` contains an array of `HistoryEntry` objects.

### Timeline

- Horizontal strip of version thumbnails (240px wide, lazy-loaded) below the main view
- Click any past version to inspect it full-size in a dynamic fullscreen overlay (built for this view — supports dynamic version count, unlike the static preview page carousels)
- "Compare to current" pulls a past version into the side-by-side view against the current champion
- "Reference this" lets user add a note (e.g., "use the colors from this version") that gets included in the next LLM generation prompt

## Session Storage

Persistent JSON files on disk, surviving server restarts.

```
example_gen/sessions/
  └── {session-id}/
      ├── session.json
      ├── versions/
      │   ├── v1.prompt             # instruction/prompt that produced this version
      │   ├── v1.svg                # generated output (extension varies by platform)
      │   ├── v1-screenshot.png     # full-resolution rendered screenshot
      │   ├── v1-thumb.png          # 240px wide thumbnail for timeline strip
      │   ├── v2.prompt
      │   ├── v2.svg
      │   ├── v2-screenshot.png
      │   ├── v2-thumb.png
      │   └── ...
      ├── annotations/
      │   ├── v1-annotations.json   # region data for the feedback that produced v2
      │   ├── v1-annotated.png      # screenshot with rectangles composited (full-res)
      │   ├── wip.json              # work-in-progress annotations (saved via POST .../annotations)
      │   └── ...
      └── history.json              # ordered list of HistoryEntry objects
```

### Session Schema

```typescript
interface Session {
  id: string
  name: string
  platform: string              // "nakkas" | "recraft" | "fal-ai" | "claude-svg" | "excalidraw" | "stitch"
  status: "pending" | "active" | "finalized"
  currentChampion?: string      // version identifier, e.g. "v3". Absent when status is "pending" (from-scratch flow before first pick)
  outputExtension: string       // ".svg" | ".png" | ".html" | ".json" (Excalidraw)
  versionCount: number
  createdAt: string             // ISO 8601
  updatedAt: string             // ISO 8601
  sourceAsset?: string          // path to original asset if started from gallery
}

interface VersionSummary {
  version: string               // e.g. "v3"
  outputExtension: string
  hasPrompt: boolean
  hasScreenshot: boolean
  hasThumb: boolean
  createdAt: string             // ISO 8601
}
```

**Session statuses:**
- `"pending"` — from-scratch flow: session created, no versions yet (or initial candidates generated but no champion picked)
- `"active"` — champion selected, refinement in progress
- `"finalized"` — champion exported, session is read-only

### Prompt File Format

The `.prompt` file is a JSON file storing the full LLM request context for reproducibility:

```typescript
interface PromptFile {
  systemPrompt: string          // the system prompt used
  userMessage: string           // the user message (annotations, feedback, source)
  model: string                 // OpenAI model used, e.g. "gpt-4o"
  platform: string
  parentVersion?: string        // which version this was derived from
  timestamp: string             // ISO 8601
}
```

This format is consistent across platforms. The `userMessage` field contains the platform-specific content (SVG source for Nakkas, image prompt for Recraft, etc.). Storing the full request context means any version can be reproduced by replaying the prompt.

**Key insight:** The real artifact being refined is the **prompt**, not just the output. Each version stores the prompt that produced it, so results are reproducible. "Finalize" exports both the champion asset AND its winning prompt — reusable as a template for similar assets.

## Session Lifecycle

1. **Start from gallery:** Click "Refine" on any existing asset → creates session with that asset as v1, status `"active"`, `currentChampion: "v1"`
2. **Start from scratch:** Click "New Generation" → describe what you want, pick platform → session created with status `"pending"` → generates two initial candidates (two sequential adapter calls) → user picks starting champion → status transitions to `"active"`
3. **Resume:** Sessions list shows all active/completed sessions with champion thumbnails
4. **Finalize:** Click "Finalize" → champion asset + prompt copied to the appropriate platform output directory (e.g., `nakkas/`) → status transitions to `"finalized"`

## Error Handling

**OpenAI API errors (rate limit, timeout, malformed response):**
- Adapter catches the error and calls `onProgress("Error: [message]")`
- Server streams an SSE error event: `{ type: "error", message: "..." }`
- No version is created — session state is unchanged
- Browser shows inline error with "Retry" button that re-submits the same annotations/feedback

**Playwright rendering errors (SVG parse failure, timeout):**
- Server logs the error and streams SSE error event
- The adapter's `source` output is still saved (the SVG/prompt text is valid even if rendering failed)
- Version is created without a screenshot — marked in `VersionSummary.hasScreenshot: false`
- User can retry rendering or proceed with annotation on the source directly

**Malformed SVG from OpenAI:**
- If Playwright fails to render the returned SVG, treated as a rendering error (above)
- The raw SVG source is preserved in the version directory for debugging

## Audience

Designed for team use, not just the original developer. The UI needs to be self-explanatory with clear affordances for annotation tools and the feedback loop concept. Sessions are nameable and browsable by any team member.

## Platform Integration

- New Hono server replaces existing `www/server.ts` — serves both static gallery and refinement API on `:3333`
- Reuses existing dark theme and Verdigris brand colors
- Gallery gets "Refine" buttons on existing asset cards
- New `/refine` route for session management
- Design tokens consumed from parent design system repo via existing `scripts/load-tokens.ts` (imported by server, path resolution relative to project root)

## Scope Boundaries

**In scope:**
- New Hono-based server replacing `www/server.ts` (static files + API)
- Annotation UI (rectangular regions with green/red sentiment + text notes, DOM overlay, keyboard shortcuts)
- Annotation popover with Enter/Escape/click-outside save/cancel behavior
- Side-by-side comparison with winner selection and "They're Equal" (keep champion)
- Full version timeline with dynamic fullscreen overlay, compare-to-current, and reference actions
- Persistent session storage (JSON on disk) with WIP annotation saves
- Nakkas adapter (OpenAI generates SVG directly, no MCP bridging)
- Multi-turn conversation history for token efficiency
- Server API routes with SSE for generation progress (one generation per session at a time)
- Gallery integration ("Refine" button on existing assets)
- Screenshot rendering via Playwright (SVG/HTML → PNG, singleton browser instance)
- Annotation compositing via Sharp (rectangles + labels onto PNGs)
- Thumbnail generation via Sharp (240px wide, synchronous before SSE "done")
- Image resize to max 1200px wide before LLM vision input
- Error handling with retry capability
- Centralized model selection via `OPENAI_MODEL` env var
- Concrete request/response schemas for all API routes
- UI loading/error states during generation

**Out of scope (future work):**
- Adapters for Recraft, fal.ai, Claude SVG, Excalidraw, Stitch (same interface, built later)
- MCP bridging for Nakkas (direct SVG generation is sufficient for now)
- Region resizability (draw + delete is MVP)
- User authentication / multi-user session ownership
- Real-time collaboration (multiple users annotating simultaneously)
- Automated quality scoring (no-human-in-the-loop evaluation)
- Mobile/touch annotation support
- Persistent conversation history across server restarts
