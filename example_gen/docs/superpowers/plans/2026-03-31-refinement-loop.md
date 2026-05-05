# Asset Refinement Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an iterative visual asset refinement tool that lets users compare side-by-side, annotate with green/red regions, and have OpenAI generate improved versions in a tournament loop.

**Architecture:** Hono server replacing existing `www/server.ts`, session storage on disk as JSON, Playwright for SVG→PNG rendering, Sharp for annotation compositing, OpenAI `gpt-4o` for interpreting feedback and generating revised SVGs. Vanilla JS frontend with DOM overlay annotation canvas. Nakkas adapter first.

**Tech Stack:** Hono, @hono/node-server, Playwright, Sharp, OpenAI SDK, Vitest, Vanilla JS, TypeScript (server)

**Spec:** `docs/superpowers/specs/2026-03-31-refinement-loop-design.md`

---

## File Structure

```
example_gen/
├── server/
│   ├── types.ts               # All shared TypeScript interfaces
│   ├── session-store.ts       # Session CRUD on disk (JSON files)
│   ├── renderer.ts            # Playwright singleton — SVG/HTML → PNG
│   ├── compositor.ts          # Sharp — annotation overlay compositing + thumbnails
│   ├── session-routes.ts      # Hono routes: session CRUD + annotations + pick + finalize
│   ├── generate-routes.ts     # Hono routes: /generate + SSE /generate/events
│   └── nakkas-adapter.ts      # Nakkas generation adapter (OpenAI gpt-4o)
├── www/
│   ├── server.ts              # REPLACE — Hono server entry point
│   ├── index.html             # MODIFY — add "Refine" buttons to gallery cards
│   └── refine/
│       ├── index.html         # Sessions list page
│       ├── session.html       # Refinement view page
│       └── js/
│           ├── api.js         # API client + SSE event listener
│           ├── annotation.js  # DOM overlay canvas, rectangle drawing, popover
│           ├── comparison.js  # Side-by-side view, pick winner
│           ├── timeline.js    # Thumbnail strip, fullscreen overlay, compare/reference
│           └── session.js     # Page orchestrator — ties phases together
├── tests/
│   ├── session-store.test.ts  # Session CRUD tests
│   ├── compositor.test.ts     # Annotation compositing tests
│   └── nakkas-adapter.test.ts # Adapter tests (mocked OpenAI)
├── package.json               # MODIFY — add deps
└── vitest.config.ts           # NEW — test config
```

---

### Task 1: Project Setup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install dependencies**

```bash
cd C:/Users/isjav/VERDIGRIS_z2o/design/example_gen
npm install hono @hono/node-server openai sharp
npm install -D vitest playwright @types/node
npx playwright install chromium
```

- [ ] **Step 2: Update package.json scripts**

Add to `"scripts"` in `package.json`:

```json
{
  "scripts": {
    "start": "tsx www/server.ts",
    "dev": "tsx watch www/server.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "generate": "tsx scripts/generate.ts",
    "generate:mermaid": "tsx scripts/generate-mermaid.ts"
  }
}
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: ".",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Verify setup**

Run: `npx vitest run`
Expected: "No test files found" (no tests yet, but vitest itself works)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add hono, openai, sharp, playwright, vitest deps"
```

---

### Task 2: Shared Type Definitions

**Files:**
- Create: `server/types.ts`

- [ ] **Step 1: Create type definitions**

Create `server/types.ts`:

```typescript
// ── Annotation ───────────────────────────────────────────────────────

export interface Annotation {
  id: string;
  x: number;       // percentage (0-100) from left
  y: number;       // percentage (0-100) from top
  width: number;   // percentage of image width
  height: number;  // percentage of image height
  sentiment: "positive" | "negative";
  note: string;
}

// ── Session ──────────────────────────────────────────────────────────

export type Platform = "nakkas" | "recraft" | "fal-ai" | "claude-svg" | "excalidraw" | "stitch";
export type SessionStatus = "pending" | "active" | "finalized";

export interface Session {
  id: string;
  name: string;
  platform: Platform;
  status: SessionStatus;
  currentChampion?: string;     // e.g. "v3"
  outputExtension: string;     // ".svg" | ".png" | ".html" | ".json"
  versionCount: number;
  createdAt: string;           // ISO 8601
  updatedAt: string;           // ISO 8601
  sourceAsset?: string;        // path to original asset if started from gallery
}

export interface VersionSummary {
  version: string;             // e.g. "v3"
  outputExtension: string;
  hasPrompt: boolean;
  hasScreenshot: boolean;
  hasThumb: boolean;
  createdAt: string;           // ISO 8601
}

// ── History ──────────────────────────────────────────────────────────

export interface HistoryEntry {
  round: number;
  champion: string;
  challenger: string;
  winner: string;             // version id or "tie"
  annotationsUsed: string;    // filename in annotations/ dir
  overallFeedback: string;
  timestamp: string;          // ISO 8601
}

// ── Prompt File ──────────────────────────────────────────────────────

export interface PromptFile {
  systemPrompt: string;
  userMessage: string;
  model: string;
  platform: string;
  parentVersion?: string;
  timestamp: string;          // ISO 8601
}

// ── Generation Adapter ───────────────────────────────────────────────

export interface ReferencedVersion {
  version: string;
  note: string;
  source: string;
  rendered?: Buffer;
}

export interface GenerateRequest {
  currentSource: string;
  annotations: Annotation[];
  annotatedScreenshot: Buffer;
  overallFeedback: string;
  referencedVersions?: ReferencedVersion[];
  onProgress: (message: string) => void;
}

export interface GenerateResult {
  source: string;
  rendered?: Buffer;
}

export interface GenerationAdapter {
  platform: string;
  generate(request: GenerateRequest): Promise<GenerateResult>;
}

// ── API Request/Response Bodies ──────────────────────────────────────

export interface CreateSessionBody {
  name: string;
  platform: Platform;
  sourceAsset?: string;
}

export interface GenerateRequestBody {
  annotations: Annotation[];
  overallFeedback: string;
  referencedVersions?: { version: string; note: string }[];
}

export interface PickWinnerBody {
  winner: "champion" | "challenger" | "tie";
}

export interface SaveAnnotationsBody {
  annotations: Annotation[];
  overallFeedback?: string;
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsx --eval "import './server/types.ts'; console.log('types OK')"`
Expected: `types OK`

- [ ] **Step 3: Commit**

```bash
git add server/types.ts
git commit -m "feat(refine): add shared type definitions"
```

---

### Task 3: Session Store

**Files:**
- Create: `server/session-store.ts`
- Create: `tests/session-store.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/session-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SessionStore } from "../server/session-store.js";

let store: SessionStore;
let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "refine-test-"));
  store = new SessionStore(tempDir);
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("SessionStore", () => {
  describe("create", () => {
    it("creates a session with correct defaults", () => {
      const session = store.create({ name: "Test", platform: "nakkas" });
      expect(session.name).toBe("Test");
      expect(session.platform).toBe("nakkas");
      expect(session.status).toBe("pending");
      expect(session.currentChampion).toBeUndefined();
      expect(session.outputExtension).toBe(".svg");
      expect(session.versionCount).toBe(0);
      expect(session.id).toBeTruthy();
    });

    it("creates session directory on disk", () => {
      const session = store.create({ name: "Test", platform: "nakkas" });
      const { existsSync } = require("node:fs");
      expect(existsSync(join(tempDir, session.id, "session.json"))).toBe(true);
      expect(existsSync(join(tempDir, session.id, "versions"))).toBe(true);
      expect(existsSync(join(tempDir, session.id, "annotations"))).toBe(true);
    });

    it("copies source asset as v1 when sourceAsset provided", () => {
      const { writeFileSync, existsSync } = require("node:fs");
      const assetPath = join(tempDir, "test-asset.svg");
      writeFileSync(assetPath, "<svg>test</svg>");

      const session = store.create({
        name: "From Gallery",
        platform: "nakkas",
        sourceAsset: assetPath,
      });

      expect(session.status).toBe("active");
      expect(session.currentChampion).toBe("v1");
      expect(session.versionCount).toBe(1);
      expect(existsSync(join(tempDir, session.id, "versions", "v1.svg"))).toBe(true);
    });
  });

  describe("list", () => {
    it("returns all sessions", () => {
      store.create({ name: "A", platform: "nakkas" });
      store.create({ name: "B", platform: "nakkas" });
      expect(store.list()).toHaveLength(2);
    });
  });

  describe("get", () => {
    it("returns session by id", () => {
      const created = store.create({ name: "Test", platform: "nakkas" });
      const fetched = store.get(created.id);
      expect(fetched?.name).toBe("Test");
    });

    it("returns null for unknown id", () => {
      expect(store.get("nonexistent")).toBeNull();
    });
  });

  describe("update", () => {
    it("updates session name", () => {
      const session = store.create({ name: "Old", platform: "nakkas" });
      const updated = store.update(session.id, { name: "New" });
      expect(updated?.name).toBe("New");
      // Re-read from disk
      expect(store.get(session.id)?.name).toBe("New");
    });
  });

  describe("delete", () => {
    it("removes session directory", () => {
      const { existsSync } = require("node:fs");
      const session = store.create({ name: "Test", platform: "nakkas" });
      const dir = join(tempDir, session.id);
      expect(existsSync(dir)).toBe(true);
      store.delete(session.id);
      expect(existsSync(dir)).toBe(false);
    });
  });

  describe("addVersion", () => {
    it("writes version files and increments count", () => {
      const { existsSync, readFileSync } = require("node:fs");
      const session = store.create({ name: "Test", platform: "nakkas" });
      store.update(session.id, { status: "active", currentChampion: "v1" });

      store.addVersion(session.id, "v2", {
        source: "<svg>v2</svg>",
        screenshot: Buffer.from("png-data"),
        thumb: Buffer.from("thumb-data"),
        prompt: { systemPrompt: "sys", userMessage: "user", model: "gpt-4o", platform: "nakkas", timestamp: new Date().toISOString() },
      });

      const dir = join(tempDir, session.id, "versions");
      expect(existsSync(join(dir, "v2.svg"))).toBe(true);
      expect(readFileSync(join(dir, "v2.svg"), "utf-8")).toBe("<svg>v2</svg>");
      expect(existsSync(join(dir, "v2-screenshot.png"))).toBe(true);
      expect(existsSync(join(dir, "v2-thumb.png"))).toBe(true);
      expect(existsSync(join(dir, "v2.prompt"))).toBe(true);

      const updated = store.get(session.id);
      expect(updated?.versionCount).toBe(2);
    });
  });

  describe("listVersions", () => {
    it("returns version summaries", () => {
      const session = store.create({ name: "Test", platform: "nakkas" });

      store.addVersion(session.id, "v1", {
        source: "<svg>v1</svg>",
        screenshot: Buffer.from("png"),
        thumb: Buffer.from("thumb"),
        prompt: { systemPrompt: "s", userMessage: "u", model: "gpt-4o", platform: "nakkas", timestamp: new Date().toISOString() },
      });

      const versions = store.listVersions(session.id);
      expect(versions).toHaveLength(1);
      expect(versions[0].version).toBe("v1");
      expect(versions[0].hasScreenshot).toBe(true);
      expect(versions[0].hasThumb).toBe(true);
      expect(versions[0].hasPrompt).toBe(true);
    });
  });

  describe("saveAnnotations / getAnnotations", () => {
    it("saves and retrieves annotations", () => {
      const session = store.create({ name: "Test", platform: "nakkas" });
      const annotations = [{ id: "a1", x: 10, y: 20, width: 30, height: 40, sentiment: "positive" as const, note: "nice" }];
      store.saveAnnotations(session.id, "v1", annotations, "looks good");

      const saved = store.getAnnotations(session.id, "v1");
      expect(saved?.annotations).toHaveLength(1);
      expect(saved?.annotations[0].note).toBe("nice");
      expect(saved?.overallFeedback).toBe("looks good");
    });
  });

  describe("saveWipAnnotations / getWipAnnotations", () => {
    it("saves and retrieves WIP annotations", () => {
      const session = store.create({ name: "Test", platform: "nakkas" });
      const annotations = [{ id: "a1", x: 10, y: 20, width: 30, height: 40, sentiment: "negative" as const, note: "fix" }];
      store.saveWipAnnotations(session.id, annotations, "needs work");

      const wip = store.getWipAnnotations(session.id);
      expect(wip?.annotations).toHaveLength(1);
      expect(wip?.overallFeedback).toBe("needs work");
    });
  });

  describe("addHistoryEntry / getHistory", () => {
    it("appends history entries", () => {
      const session = store.create({ name: "Test", platform: "nakkas" });
      store.addHistoryEntry(session.id, {
        round: 1,
        champion: "v1",
        challenger: "v2",
        winner: "v2",
        annotationsUsed: "v1-annotations.json",
        overallFeedback: "better colors",
        timestamp: new Date().toISOString(),
      });

      const history = store.getHistory(session.id);
      expect(history).toHaveLength(1);
      expect(history[0].winner).toBe("v2");
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/session-store.test.ts`
Expected: FAIL — module `../server/session-store.js` not found

- [ ] **Step 3: Implement SessionStore**

Create `server/session-store.ts`:

```typescript
import { randomUUID } from "node:crypto";
import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync,
  readdirSync, copyFileSync, statSync,
} from "node:fs";
import { join } from "node:path";
import type {
  Session, Platform, VersionSummary, Annotation,
  HistoryEntry, PromptFile, CreateSessionBody,
} from "./types.js";

const EXTENSION_MAP: Record<Platform, string> = {
  nakkas: ".svg",
  "claude-svg": ".svg",
  recraft: ".png",
  "fal-ai": ".png",
  excalidraw: ".json",
  stitch: ".html",
};

interface AddVersionData {
  source: string;
  screenshot: Buffer;
  thumb: Buffer;
  prompt: PromptFile;
}

interface AnnotationsData {
  annotations: Annotation[];
  overallFeedback?: string;
}

export class SessionStore {
  constructor(private sessionsDir: string) {
    mkdirSync(sessionsDir, { recursive: true });
  }

  private sessionDir(id: string): string {
    return join(this.sessionsDir, id);
  }

  private readSession(id: string): Session | null {
    const path = join(this.sessionDir(id), "session.json");
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf-8"));
  }

  private writeSession(session: Session): void {
    const path = join(this.sessionDir(session.id), "session.json");
    writeFileSync(path, JSON.stringify(session, null, 2));
  }

  create(body: CreateSessionBody): Session {
    const id = randomUUID().slice(0, 8);
    const ext = EXTENSION_MAP[body.platform] ?? ".svg";
    const now = new Date().toISOString();
    const dir = this.sessionDir(id);

    mkdirSync(join(dir, "versions"), { recursive: true });
    mkdirSync(join(dir, "annotations"), { recursive: true });

    // Initialize history.json
    writeFileSync(join(dir, "history.json"), "[]");

    let status: Session["status"] = "pending";
    let currentChampion: string | undefined;
    let versionCount = 0;

    if (body.sourceAsset && existsSync(body.sourceAsset)) {
      copyFileSync(body.sourceAsset, join(dir, "versions", `v1${ext}`));
      status = "active";
      currentChampion = "v1";
      versionCount = 1;
    }

    const session: Session = {
      id,
      name: body.name,
      platform: body.platform,
      status,
      currentChampion,
      outputExtension: ext,
      versionCount,
      createdAt: now,
      updatedAt: now,
      sourceAsset: body.sourceAsset,
    };

    this.writeSession(session);
    return session;
  }

  list(): Session[] {
    if (!existsSync(this.sessionsDir)) return [];
    return readdirSync(this.sessionsDir)
      .map((name) => this.readSession(name))
      .filter((s): s is Session => s !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  get(id: string): Session | null {
    return this.readSession(id);
  }

  update(id: string, updates: Partial<Pick<Session, "name" | "status" | "currentChampion">>): Session | null {
    const session = this.readSession(id);
    if (!session) return null;
    Object.assign(session, updates, { updatedAt: new Date().toISOString() });
    this.writeSession(session);
    return session;
  }

  delete(id: string): boolean {
    const dir = this.sessionDir(id);
    if (!existsSync(dir)) return false;
    rmSync(dir, { recursive: true, force: true });
    return true;
  }

  addVersion(id: string, version: string, data: AddVersionData): void {
    const session = this.readSession(id);
    if (!session) throw new Error(`Session ${id} not found`);

    const dir = join(this.sessionDir(id), "versions");
    const ext = session.outputExtension;

    writeFileSync(join(dir, `${version}${ext}`), data.source);
    writeFileSync(join(dir, `${version}-screenshot.png`), data.screenshot);
    writeFileSync(join(dir, `${version}-thumb.png`), data.thumb);
    writeFileSync(join(dir, `${version}.prompt`), JSON.stringify(data.prompt, null, 2));

    session.versionCount += 1;
    session.updatedAt = new Date().toISOString();
    this.writeSession(session);
  }

  getVersionSource(id: string, version: string): string | null {
    const session = this.readSession(id);
    if (!session) return null;
    const path = join(this.sessionDir(id), "versions", `${version}${session.outputExtension}`);
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf-8");
  }

  getVersionFile(id: string, filename: string): Buffer | null {
    const path = join(this.sessionDir(id), "versions", filename);
    if (!existsSync(path)) return null;
    return readFileSync(path);
  }

  listVersions(id: string): VersionSummary[] {
    const session = this.readSession(id);
    if (!session) return [];
    const dir = join(this.sessionDir(id), "versions");
    if (!existsSync(dir)) return [];

    const files = readdirSync(dir);
    const versions: Map<string, VersionSummary> = new Map();

    for (const file of files) {
      const match = file.match(/^(v\d+)/);
      if (!match) continue;
      const v = match[1];
      if (!versions.has(v)) {
        const stat = statSync(join(dir, file));
        versions.set(v, {
          version: v,
          outputExtension: session.outputExtension,
          hasPrompt: false,
          hasScreenshot: false,
          hasThumb: false,
          createdAt: stat.mtime.toISOString(),
        });
      }
      const summary = versions.get(v)!;
      if (file.endsWith(".prompt")) summary.hasPrompt = true;
      if (file.endsWith("-screenshot.png")) summary.hasScreenshot = true;
      if (file.endsWith("-thumb.png")) summary.hasThumb = true;
    }

    return Array.from(versions.values()).sort(
      (a, b) => parseInt(a.version.slice(1)) - parseInt(b.version.slice(1))
    );
  }

  saveAnnotations(id: string, version: string, annotations: Annotation[], overallFeedback?: string): void {
    const dir = join(this.sessionDir(id), "annotations");
    writeFileSync(
      join(dir, `${version}-annotations.json`),
      JSON.stringify({ annotations, overallFeedback }, null, 2)
    );
  }

  getAnnotations(id: string, version: string): AnnotationsData | null {
    const path = join(this.sessionDir(id), "annotations", `${version}-annotations.json`);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf-8"));
  }

  saveWipAnnotations(id: string, annotations: Annotation[], overallFeedback?: string): void {
    const dir = join(this.sessionDir(id), "annotations");
    writeFileSync(
      join(dir, "wip.json"),
      JSON.stringify({ annotations, overallFeedback }, null, 2)
    );
  }

  getWipAnnotations(id: string): AnnotationsData | null {
    const path = join(this.sessionDir(id), "annotations", "wip.json");
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf-8"));
  }

  addHistoryEntry(id: string, entry: HistoryEntry): void {
    const path = join(this.sessionDir(id), "history.json");
    const history: HistoryEntry[] = existsSync(path)
      ? JSON.parse(readFileSync(path, "utf-8"))
      : [];
    history.push(entry);
    writeFileSync(path, JSON.stringify(history, null, 2));
  }

  getHistory(id: string): HistoryEntry[] {
    const path = join(this.sessionDir(id), "history.json");
    if (!existsSync(path)) return [];
    return JSON.parse(readFileSync(path, "utf-8"));
  }

  /** Returns next version id (e.g. "v3" if versionCount is 2) */
  nextVersion(id: string): string {
    const session = this.readSession(id);
    if (!session) throw new Error(`Session ${id} not found`);
    return `v${session.versionCount + 1}`;
  }

  /** Save a partial version (source only, no screenshot) for debugging failed renders */
  addPartialVersion(id: string, version: string, source: string, prompt: PromptFile): void {
    const session = this.readSession(id);
    if (!session) throw new Error(`Session ${id} not found`);

    const dir = join(this.sessionDir(id), "versions");
    const ext = session.outputExtension;

    writeFileSync(join(dir, `${version}${ext}`), source);
    writeFileSync(join(dir, `${version}.prompt`), JSON.stringify(prompt, null, 2));

    session.versionCount += 1;
    session.updatedAt = new Date().toISOString();
    this.writeSession(session);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/session-store.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add server/session-store.ts tests/session-store.test.ts
git commit -m "feat(refine): add session store with disk persistence"
```

---

### Task 4: Annotation Compositor

**Files:**
- Create: `server/compositor.ts`
- Create: `tests/compositor.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/compositor.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { compositeAnnotations, generateThumbnail, resizeForLLM } from "../server/compositor.js";
import type { Annotation } from "../server/types.js";

describe("compositor", () => {
  // Create a simple 400x200 red PNG for testing
  async function makeTestImage(): Promise<Buffer> {
    return sharp({ create: { width: 400, height: 200, channels: 4, background: { r: 200, g: 50, b: 50, alpha: 1 } } })
      .png()
      .toBuffer();
  }

  describe("compositeAnnotations", () => {
    it("returns a PNG buffer with annotations drawn", async () => {
      const image = await makeTestImage();
      const annotations: Annotation[] = [
        { id: "a1", x: 10, y: 10, width: 30, height: 40, sentiment: "positive", note: "nice gradient" },
        { id: "a2", x: 60, y: 50, width: 20, height: 30, sentiment: "negative", note: "" },
      ];

      const result = await compositeAnnotations(image, annotations);
      expect(result).toBeInstanceOf(Buffer);

      const meta = await sharp(result).metadata();
      expect(meta.format).toBe("png");
      expect(meta.width).toBe(400);
      expect(meta.height).toBe(200);
    });

    it("handles empty annotations", async () => {
      const image = await makeTestImage();
      const result = await compositeAnnotations(image, []);
      const meta = await sharp(result).metadata();
      expect(meta.width).toBe(400);
    });
  });

  describe("generateThumbnail", () => {
    it("resizes to 240px wide", async () => {
      const image = await makeTestImage();
      const thumb = await generateThumbnail(image);
      const meta = await sharp(thumb).metadata();
      expect(meta.width).toBe(240);
      expect(meta.height).toBe(120); // preserves 2:1 aspect ratio
    });
  });

  describe("resizeForLLM", () => {
    it("resizes to max 1200px wide", async () => {
      const big = await sharp({ create: { width: 2400, height: 1200, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } })
        .png()
        .toBuffer();

      const resized = await resizeForLLM(big);
      const meta = await sharp(resized).metadata();
      expect(meta.width).toBe(1200);
      expect(meta.height).toBe(600);
    });

    it("does not upscale small images", async () => {
      const image = await makeTestImage(); // 400x200
      const resized = await resizeForLLM(image);
      const meta = await sharp(resized).metadata();
      expect(meta.width).toBe(400);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/compositor.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement compositor**

Create `server/compositor.ts`:

```typescript
import sharp from "sharp";
import type { Annotation } from "./types.js";

const GREEN = "#22c55e";
const RED = "#ef4444";
const GREEN_FILL = "rgba(34,197,94,0.2)";
const RED_FILL = "rgba(239,68,68,0.2)";

/**
 * Composites annotation rectangles + labels onto a screenshot PNG.
 * Returns the composited PNG buffer.
 */
export async function compositeAnnotations(
  screenshot: Buffer,
  annotations: Annotation[]
): Promise<Buffer> {
  if (annotations.length === 0) return screenshot;

  const meta = await sharp(screenshot).metadata();
  const imgW = meta.width!;
  const imgH = meta.height!;

  // Build SVG overlay
  const rects = annotations.map((a) => {
    const x = (a.x / 100) * imgW;
    const y = (a.y / 100) * imgH;
    const w = (a.width / 100) * imgW;
    const h = (a.height / 100) * imgH;
    const color = a.sentiment === "positive" ? GREEN : RED;
    const fill = a.sentiment === "positive" ? GREEN_FILL : RED_FILL;

    let label = "";
    if (a.note) {
      // Position label above rect, or below if near top edge
      const labelY = y < 24 ? y + h + 18 : y - 6;
      label = `
        <rect x="${x}" y="${labelY - 14}" width="${Math.min(a.note.length * 8 + 12, w + 40)}" height="20" rx="4" fill="rgba(0,0,0,0.75)"/>
        <text x="${x + 6}" y="${labelY}" fill="white" font-size="14" font-family="Inter, sans-serif">${escapeXml(a.note)}</text>
      `;
    }

    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${color}" stroke-width="3" rx="2"/>
      ${label}
    `;
  }).join("\n");

  const svgOverlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${imgW}" height="${imgH}">${rects}</svg>`
  );

  return sharp(screenshot)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
}

/**
 * Generates a 240px wide thumbnail.
 */
export async function generateThumbnail(screenshot: Buffer): Promise<Buffer> {
  return sharp(screenshot)
    .resize(240, null, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
}

/**
 * Resizes image to max 1200px wide for LLM vision input.
 * Does not upscale small images.
 */
export async function resizeForLLM(image: Buffer): Promise<Buffer> {
  const meta = await sharp(image).metadata();
  if (meta.width! <= 1200) return image;
  return sharp(image)
    .resize(1200, null, { fit: "inside" })
    .png()
    .toBuffer();
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/compositor.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add server/compositor.ts tests/compositor.test.ts
git commit -m "feat(refine): add annotation compositor with Sharp"
```

---

### Task 5: Playwright Renderer

**Files:**
- Create: `server/renderer.ts`

- [ ] **Step 1: Implement renderer**

Create `server/renderer.ts`:

```typescript
import { chromium, type Browser, type Page } from "playwright";

let browser: Browser | null = null;

/**
 * Launches (or reuses) a singleton Chromium browser instance.
 * Call shutdown() on SIGTERM to close it.
 */
export async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

/**
 * Renders SVG source to a PNG buffer via Playwright.
 * For animated SVGs, waits 500ms before capture to let animations settle.
 */
export async function renderSvgToPng(svgSource: string): Promise<Buffer> {
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    const html = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  body { background: transparent; display: inline-block; }
</style></head>
<body>${svgSource}</body></html>`;

    await page.setContent(html, { waitUntil: "load" });

    // Wait for animations to settle
    await page.waitForTimeout(500);

    // Get the SVG's bounding box for tight crop
    const bbox = await page.evaluate(() => {
      const svg = document.querySelector("svg");
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      return { width: Math.ceil(rect.width), height: Math.ceil(rect.height) };
    });

    if (bbox) {
      await page.setViewportSize({ width: bbox.width, height: bbox.height });
    }

    const screenshot = await page.screenshot({ type: "png", omitBackground: true });
    return Buffer.from(screenshot);
  } finally {
    await page.close();
  }
}

/**
 * Renders an HTML string to a PNG buffer via Playwright.
 */
export async function renderHtmlToPng(htmlSource: string): Promise<Buffer> {
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.setContent(htmlSource, { waitUntil: "load" });
    await page.waitForTimeout(500);

    const screenshot = await page.screenshot({ type: "png", fullPage: true });
    return Buffer.from(screenshot);
  } finally {
    await page.close();
  }
}

/**
 * Shuts down the singleton browser. Call on SIGTERM / server shutdown.
 */
export async function shutdown(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsx --eval "import './server/renderer.ts'; console.log('renderer OK')"`
Expected: `renderer OK`

- [ ] **Step 3: Commit**

```bash
git add server/renderer.ts
git commit -m "feat(refine): add Playwright SVG/HTML renderer singleton"
```

---

### Task 6: Nakkas Adapter (OpenAI)

**Files:**
- Create: `server/nakkas-adapter.ts`
- Create: `tests/nakkas-adapter.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/nakkas-adapter.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NakkasAdapter } from "../server/nakkas-adapter.js";
import type { GenerateRequest } from "../server/types.js";

// Mock OpenAI
vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{
              message: {
                content: "```svg\n<svg><rect fill=\"#0fc8c3\"/></svg>\n```",
              },
            }],
          }),
        },
      };
    },
  };
});

describe("NakkasAdapter", () => {
  let adapter: NakkasAdapter;

  beforeEach(() => {
    adapter = new NakkasAdapter();
  });

  it("has platform set to nakkas", () => {
    expect(adapter.platform).toBe("nakkas");
  });

  it("returns SVG source extracted from code block", async () => {
    const progress = vi.fn();
    const request: GenerateRequest = {
      currentSource: "<svg><circle/></svg>",
      annotations: [{ id: "a1", x: 10, y: 10, width: 20, height: 20, sentiment: "negative", note: "too plain" }],
      annotatedScreenshot: Buffer.from("fake-png"),
      overallFeedback: "make it more colorful",
      onProgress: progress,
    };

    const result = await adapter.generate(request);

    expect(result.source).toContain("<svg>");
    expect(result.source).toContain("#0fc8c3");
    expect(result.rendered).toBeUndefined(); // server renders, not adapter
  });

  it("calls onProgress at standard stages", async () => {
    const progress = vi.fn();
    const request: GenerateRequest = {
      currentSource: "<svg/>",
      annotations: [],
      annotatedScreenshot: Buffer.from("fake"),
      overallFeedback: "improve it",
      onProgress: progress,
    };

    await adapter.generate(request);

    expect(progress).toHaveBeenCalledWith("Preparing prompt...");
    expect(progress).toHaveBeenCalledWith("Generating with OpenAI...");
    expect(progress).toHaveBeenCalledWith("Processing response...");
  });

  it("stores conversation history for multi-turn efficiency", async () => {
    const request: GenerateRequest = {
      currentSource: "<svg/>",
      annotations: [],
      annotatedScreenshot: Buffer.from("fake"),
      overallFeedback: "first round",
      onProgress: vi.fn(),
    };

    // First call — sends system prompt
    await adapter.generate(request);

    // Second call — should not re-send system prompt (uses history)
    request.overallFeedback = "second round";
    await adapter.generate(request);

    // Adapter maintains internal conversation state
    expect(adapter.hasConversationHistory("default")).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/nakkas-adapter.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement Nakkas adapter**

Create `server/nakkas-adapter.ts`:

```typescript
import OpenAI from "openai";
import type { GenerateRequest, GenerateResult, GenerationAdapter, Annotation } from "./types.js";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

const SYSTEM_PROMPT = `You are a visual asset refinement assistant for Verdigris, an energy analytics company.
You refine SVG assets based on user annotations and feedback.

Design context:
- Brand colors: verdigris teal (#0fc8c3), midnight purple (#1a0a4a), cyber yellow (#d4c520), pastel red (#e85d3a)
- Typography: Lato for headlines, Inter for body
- Style: professional, clean, data-forward

Rules:
- Use the structured annotation data (coordinates + sentiment + notes) as your primary guide
- Use the annotated screenshot as visual confirmation of what each region looks like
- Preserve elements in green-annotated regions
- Address issues in red-annotated regions
- Return the complete SVG source inside a single code block — no partial updates, no explanation outside the code block`;

type ChatMessage = OpenAI.Chat.ChatCompletionMessageParam;

export class NakkasAdapter implements GenerationAdapter {
  platform = "nakkas";
  private client: OpenAI;
  private conversations: Map<string, ChatMessage[]> = new Map();

  constructor() {
    this.client = new OpenAI();
  }

  hasConversationHistory(sessionId: string): boolean {
    return this.conversations.has(sessionId);
  }

  async generate(request: GenerateRequest, sessionId = "default"): Promise<GenerateResult> {
    request.onProgress("Preparing prompt...");

    const userContent = this.buildUserContent(request);

    // Build messages: system prompt on first call, then multi-turn
    let messages: ChatMessage[];
    const existing = this.conversations.get(sessionId);

    if (existing) {
      // Append new user turn to existing conversation
      messages = [...existing, { role: "user" as const, content: userContent }];
    } else {
      // First call — include system prompt
      messages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        { role: "user" as const, content: userContent },
      ];
    }

    request.onProgress("Generating with OpenAI...");

    const response = await this.client.chat.completions.create({
      model: MODEL,
      max_tokens: 16384,
      messages,
    });

    request.onProgress("Processing response...");

    const text = response.choices[0]?.message?.content ?? "";
    const source = this.extractSvg(text);

    // Store conversation history for multi-turn
    this.conversations.set(sessionId, [
      ...messages,
      { role: "assistant" as const, content: text },
    ]);

    return { source };
  }

  clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  private buildUserContent(request: GenerateRequest): OpenAI.Chat.ChatCompletionContentPart[] {
    const parts: OpenAI.Chat.ChatCompletionContentPart[] = [];

    // Text: current source + annotations + feedback
    let text = `Current SVG source:\n\`\`\`svg\n${request.currentSource}\n\`\`\`\n\n`;

    if (request.annotations.length > 0) {
      text += `Annotations:\n${JSON.stringify(request.annotations, null, 2)}\n\n`;
    }

    text += `Overall feedback: ${request.overallFeedback}\n`;

    if (request.referencedVersions?.length) {
      for (const ref of request.referencedVersions) {
        text += `\nReference from ${ref.version}: "${ref.note}"\nReferenced source:\n\`\`\`\n${ref.source}\n\`\`\`\n`;
      }
    }

    text += "\nGenerate an improved SVG version.";
    parts.push({ type: "text", text });

    // Image: annotated screenshot
    const base64 = request.annotatedScreenshot.toString("base64");
    parts.push({
      type: "image_url",
      image_url: { url: `data:image/png;base64,${base64}`, detail: "high" },
    });

    // Referenced version images (for raster platforms, future use)
    if (request.referencedVersions) {
      for (const ref of request.referencedVersions) {
        if (ref.rendered) {
          const refBase64 = ref.rendered.toString("base64");
          parts.push({
            type: "image_url",
            image_url: { url: `data:image/png;base64,${refBase64}`, detail: "low" },
          });
        }
      }
    }

    return parts;
  }

  private extractSvg(text: string): string {
    // Try to extract from code block
    const codeMatch = text.match(/```(?:svg|xml|html)?\n([\s\S]*?)```/);
    if (codeMatch) return codeMatch[1].trim();

    // Fallback: look for raw <svg> tags
    const svgMatch = text.match(/<svg[\s\S]*<\/svg>/);
    if (svgMatch) return svgMatch[0];

    // Last resort: return the full text
    return text.trim();
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/nakkas-adapter.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add server/nakkas-adapter.ts tests/nakkas-adapter.test.ts
git commit -m "feat(refine): add Nakkas adapter with OpenAI gpt-4o"
```

---

### Task 7: Hono Server + Static File Serving

**Files:**
- Replace: `www/server.ts`

- [ ] **Step 1: Replace www/server.ts with Hono server**

Replace the contents of `www/server.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * Example Gen server — serves static gallery + refinement API.
 * Replaces the original raw http.createServer with Hono.
 */
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { shutdown as shutdownRenderer } from "../server/renderer.js";
import { sessionRoutes } from "../server/session-routes.js";
import { generateRoutes } from "../server/generate-routes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PORT = parseInt(process.env.PORT ?? "3333", 10);

const app = new Hono();

// ── API routes ───────────────────────────────────────────────────────
app.route("/api/refine", sessionRoutes(ROOT));
app.route("/api/refine", generateRoutes(ROOT));

// ── Refine SPA pages ─────────────────────────────────────────────────
// Serve /refine/ as the sessions list
app.get("/refine", async (c) => {
  const { readFileSync } = await import("node:fs");
  const html = readFileSync(resolve(__dirname, "refine", "index.html"), "utf-8");
  return c.html(html);
});

// Serve /refine/:sessionId as the refinement view
app.get("/refine/:sessionId", async (c) => {
  const { readFileSync } = await import("node:fs");
  const html = readFileSync(resolve(__dirname, "refine", "session.html"), "utf-8");
  return c.html(html);
});

// ── Static JS for refine pages ──────────────────────────────────────
app.use("/refine/js/*", serveStatic({ root: resolve(__dirname, "refine", "js"), rewriteRequestPath: (path) => path.replace("/refine/js", "") }));

// ── Serve index.html at root ─────────────────────────────────────────
app.get("/", async (c) => {
  const { readFileSync } = await import("node:fs");
  const html = readFileSync(resolve(__dirname, "index.html"), "utf-8");
  return c.html(html);
});

// ── Static files from ROOT ───────────────────────────────────────────
app.use("/*", serveStatic({ root: ROOT }));

// ── Start ────────────────────────────────────────────────────────────
const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`\n  Example Gen server running at http://localhost:${info.port}\n`);
  console.log("  Routes:");
  console.log("    /            — Asset gallery");
  console.log("    /refine      — Refinement sessions");
  console.log("    /api/refine  — Refinement API");
  console.log();
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await shutdownRenderer();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await shutdownRenderer();
  process.exit(0);
});
```

- [ ] **Step 2: Verify it compiles** (will fail until routes exist — that's Task 8)

Run: `npx tsx --eval "console.log('server module syntax OK')"` (just verify tsx works)
Expected: `server module syntax OK`

- [ ] **Step 3: Commit**

```bash
git add www/server.ts
git commit -m "feat(refine): replace server with Hono + route skeleton"
```

---

### Task 8: Session CRUD API Routes

**Files:**
- Create: `server/session-routes.ts`

- [ ] **Step 1: Implement session routes**

Create `server/session-routes.ts`:

```typescript
import { Hono } from "hono";
import { resolve } from "node:path";
import { SessionStore } from "./session-store.js";
import type { CreateSessionBody, PickWinnerBody, SaveAnnotationsBody } from "./types.js";

export function sessionRoutes(projectRoot: string) {
  const app = new Hono();
  const store = new SessionStore(resolve(projectRoot, "sessions"));

  // POST /sessions — create
  app.post("/sessions", async (c) => {
    const body = await c.req.json<CreateSessionBody>();
    if (!body.name || !body.platform) {
      return c.json({ error: "name and platform required" }, 400);
    }
    const session = store.create(body);
    return c.json(session, 201);
  });

  // GET /sessions — list all
  app.get("/sessions", (c) => {
    return c.json(store.list());
  });

  // GET /sessions/:id — get one
  app.get("/sessions/:id", (c) => {
    const session = store.get(c.req.param("id"));
    if (!session) return c.json({ error: "not found" }, 404);
    return c.json(session);
  });

  // PATCH /sessions/:id — update metadata
  app.patch("/sessions/:id", async (c) => {
    const body = await c.req.json<{ name?: string }>();
    const session = store.update(c.req.param("id"), body);
    if (!session) return c.json({ error: "not found" }, 404);
    return c.json(session);
  });

  // DELETE /sessions/:id — delete
  app.delete("/sessions/:id", (c) => {
    const deleted = store.delete(c.req.param("id"));
    if (!deleted) return c.json({ error: "not found" }, 404);
    return c.json({ deleted: true });
  });

  // GET /sessions/:id/versions — list versions
  app.get("/sessions/:id/versions", (c) => {
    const versions = store.listVersions(c.req.param("id"));
    return c.json(versions);
  });

  // GET /sessions/:id/versions/:v — get version file
  app.get("/sessions/:id/versions/:v", (c) => {
    const id = c.req.param("id");
    const v = c.req.param("v");
    const session = store.get(id);
    if (!session) return c.json({ error: "not found" }, 404);

    const accept = c.req.header("accept") ?? "";

    // Return screenshot PNG
    if (accept.includes("image/png")) {
      const png = store.getVersionFile(id, `${v}-screenshot.png`);
      if (!png) return c.json({ error: "screenshot not found" }, 404);
      return new Response(png, { headers: { "Content-Type": "image/png" } });
    }

    // Return source
    const source = store.getVersionSource(id, v);
    if (!source) return c.json({ error: "version not found" }, 404);

    // Return prompt + source as JSON
    const promptFile = store.getVersionFile(id, `${v}.prompt`);
    return c.json({
      version: v,
      source,
      prompt: promptFile ? JSON.parse(promptFile.toString()) : null,
    });
  });

  // POST /sessions/:id/pick — record winner
  app.post("/sessions/:id/pick", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json<PickWinnerBody>();
    const session = store.get(id);
    if (!session) return c.json({ error: "not found" }, 404);

    const champion = session.currentChampion;
    const challenger = `v${session.versionCount}`;

    // Get the annotations that produced the challenger
    const annotations = champion ? store.getAnnotations(id, champion) : null;

    // Record history — "tie" keeps champion, "champion" keeps champion, "challenger" promotes
    const winnerValue = body.winner === "challenger" ? challenger : (body.winner === "tie" ? "tie" : champion!);

    store.addHistoryEntry(id, {
      round: store.getHistory(id).length + 1,
      champion: champion ?? "v0",
      challenger,
      winner: winnerValue,
      annotationsUsed: champion ? `${champion}-annotations.json` : "",
      overallFeedback: annotations?.overallFeedback ?? "",
      timestamp: new Date().toISOString(),
    });

    // Update champion only if challenger wins
    if (body.winner === "challenger") {
      store.update(id, { currentChampion: challenger });
    }
    // "champion" or "tie" — keep existing champion

    // Clear WIP annotations
    const wipPath = resolve(projectRoot, "sessions", id, "annotations", "wip.json");
    const { existsSync, unlinkSync } = await import("node:fs");
    if (existsSync(wipPath)) unlinkSync(wipPath);

    const updated = store.get(id);
    return c.json(updated);
  });

  // POST /sessions/:id/finalize — export champion
  app.post("/sessions/:id/finalize", async (c) => {
    const id = c.req.param("id");
    const session = store.get(id);
    if (!session) return c.json({ error: "not found" }, 404);
    if (!session.currentChampion) return c.json({ error: "no champion selected" }, 400);

    const { copyFileSync, existsSync } = await import("node:fs");

    // Copy champion to platform output dir
    const champVersion = session.currentChampion;
    const ext = session.outputExtension;
    const sourceFile = resolve(projectRoot, "sessions", id, "versions", `${champVersion}${ext}`);
    const promptFile = resolve(projectRoot, "sessions", id, "versions", `${champVersion}.prompt`);

    const outputDir = resolve(projectRoot, session.platform);
    const outputName = `refined-${session.name.toLowerCase().replace(/\s+/g, "-")}`;

    if (existsSync(sourceFile)) {
      copyFileSync(sourceFile, resolve(outputDir, `${outputName}${ext}`));
    }
    if (existsSync(promptFile)) {
      copyFileSync(promptFile, resolve(outputDir, `${outputName}.prompt`));
    }

    store.update(id, { status: "finalized" });
    return c.json({ exportedTo: resolve(outputDir, `${outputName}${ext}`) });
  });

  // POST /sessions/:id/annotations — save WIP
  app.post("/sessions/:id/annotations", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json<SaveAnnotationsBody>();
    const session = store.get(id);
    if (!session) return c.json({ error: "not found" }, 404);

    store.saveWipAnnotations(id, body.annotations, body.overallFeedback);
    return c.json({ saved: true });
  });

  // GET /sessions/:id/annotations/wip — get WIP
  app.get("/sessions/:id/annotations/wip", (c) => {
    const wip = store.getWipAnnotations(c.req.param("id"));
    return c.json(wip ?? { annotations: [], overallFeedback: "" });
  });

  // GET /sessions/:id/history — get history
  app.get("/sessions/:id/history", (c) => {
    return c.json(store.getHistory(c.req.param("id")));
  });

  return app;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsx --eval "import './server/session-routes.ts'; console.log('routes OK')"`
Expected: `routes OK`

- [ ] **Step 3: Commit**

```bash
git add server/session-routes.ts
git commit -m "feat(refine): add session CRUD + pick + finalize API routes"
```

---

### Task 9: Generation Route + SSE

**Files:**
- Create: `server/generate-routes.ts`

- [ ] **Step 1: Implement generation routes**

Create `server/generate-routes.ts`:

```typescript
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { SessionStore } from "./session-store.js";
import { NakkasAdapter } from "./nakkas-adapter.js";
import { compositeAnnotations, generateThumbnail, resizeForLLM } from "./compositor.js";
import { renderSvgToPng, renderHtmlToPng } from "./renderer.js";
import type { GenerateRequestBody, GenerateResult, GenerationAdapter, PromptFile } from "./types.js";

// One adapter per platform
const adapters: Record<string, GenerationAdapter> = {
  nakkas: new NakkasAdapter(),
};

// Track in-flight generations per session
const activeGenerations = new Map<string, { id: string; progress: string[]; done: boolean; error?: string; version?: string }>();

export function generateRoutes(projectRoot: string) {
  const app = new Hono();
  const store = new SessionStore(resolve(projectRoot, "sessions"));

  // POST /sessions/:id/generate — kick off generation
  app.post("/sessions/:id/generate", async (c) => {
    const id = c.req.param("id");
    const session = store.get(id);
    if (!session) return c.json({ error: "not found" }, 404);
    if (!session.currentChampion) return c.json({ error: "no champion — pick one first" }, 400);

    // One generation at a time
    const active = activeGenerations.get(id);
    if (active && !active.done) {
      return c.json({ error: "generation already in progress" }, 409);
    }

    const body = await c.req.json<GenerateRequestBody>();
    const generationId = randomUUID().slice(0, 8);

    // Initialize tracking
    const tracking = { id: generationId, progress: [] as string[], done: false, error: undefined as string | undefined, version: undefined as string | undefined };
    activeGenerations.set(id, tracking);

    // Run generation in background
    runGeneration(id, session, body, tracking, store, projectRoot).catch((err) => {
      tracking.error = err.message ?? "Unknown error";
      tracking.done = true;
    });

    return c.json({ generationId });
  });

  // GET /sessions/:id/generate/events — SSE progress stream
  app.get("/sessions/:id/generate/events", (c) => {
    const id = c.req.param("id");

    return streamSSE(c, async (stream) => {
      let lastIndex = 0;

      while (true) {
        const tracking = activeGenerations.get(id);
        if (!tracking) {
          await stream.writeSSE({ data: JSON.stringify({ type: "error", message: "no active generation" }) });
          break;
        }

        // Send any new progress messages
        while (lastIndex < tracking.progress.length) {
          await stream.writeSSE({
            data: JSON.stringify({ type: "progress", message: tracking.progress[lastIndex] }),
          });
          lastIndex++;
        }

        if (tracking.error) {
          await stream.writeSSE({
            data: JSON.stringify({ type: "error", message: tracking.error }),
          });
          break;
        }

        if (tracking.done && tracking.version) {
          await stream.writeSSE({
            data: JSON.stringify({ type: "done", version: tracking.version }),
          });
          break;
        }

        // Poll interval
        await new Promise((r) => setTimeout(r, 200));
      }
    });
  });

  return app;
}

async function runGeneration(
  sessionId: string,
  session: ReturnType<SessionStore["get"]> & {},
  body: GenerateRequestBody,
  tracking: { progress: string[]; done: boolean; error?: string; version?: string },
  store: SessionStore,
  projectRoot: string
) {
  const emit = (msg: string) => { tracking.progress.push(msg); };

  try {
    // 1. Load current champion source
    const currentSource = store.getVersionSource(sessionId, session.currentChampion!);
    if (!currentSource) throw new Error("Champion source not found");

    // 2. Get champion screenshot for compositing
    const screenshotBuf = store.getVersionFile(sessionId, `${session.currentChampion}-screenshot.png`);
    if (!screenshotBuf) throw new Error("Champion screenshot not found");

    // 3. Save annotations
    store.saveAnnotations(sessionId, session.currentChampion!, body.annotations, body.overallFeedback);

    // 4. Composite annotations onto screenshot
    emit("Compositing annotations...");
    const annotatedScreenshot = await compositeAnnotations(screenshotBuf, body.annotations);

    // Save annotated image to disk
    const { writeFileSync } = await import("node:fs");
    writeFileSync(
      resolve(projectRoot, "sessions", sessionId, "annotations", `${session.currentChampion}-annotated.png`),
      annotatedScreenshot
    );

    // 5. Resize for LLM
    const resizedScreenshot = await resizeForLLM(annotatedScreenshot);

    // 6. Resolve referenced versions
    const referencedVersions = body.referencedVersions?.map((ref) => ({
      version: ref.version,
      note: ref.note,
      source: store.getVersionSource(sessionId, ref.version) ?? "",
      rendered: store.getVersionFile(sessionId, `${ref.version}-screenshot.png`) ?? undefined,
    }));

    // 7. Call adapter
    const adapter = adapters[session.platform];
    if (!adapter) throw new Error(`No adapter for platform: ${session.platform}`);

    const result: GenerateResult = await adapter.generate({
      currentSource,
      annotations: body.annotations,
      annotatedScreenshot: resizedScreenshot,
      overallFeedback: body.overallFeedback,
      referencedVersions,
      onProgress: emit,
    });

    // 8. Determine version number
    const newVersion = store.nextVersion(sessionId);

    const prompt: PromptFile = {
      systemPrompt: "(see adapter)",
      userMessage: body.overallFeedback,
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
      platform: session.platform,
      parentVersion: session.currentChampion!,
      timestamp: new Date().toISOString(),
    };

    // 9. Render to PNG if adapter didn't provide it
    let rendered: Buffer;
    try {
      if (result.rendered) {
        rendered = result.rendered;
      } else {
        emit("Rendering screenshot...");
        if (session.outputExtension === ".html") {
          rendered = await renderHtmlToPng(result.source);
        } else {
          rendered = await renderSvgToPng(result.source);
        }
      }
    } catch (renderErr: any) {
      // Save source even if rendering failed (spec: preserve for debugging)
      emit("Rendering failed — saving source for debugging...");
      store.addPartialVersion(sessionId, newVersion, result.source, prompt);
      tracking.error = `Rendering failed: ${renderErr.message}. Source saved as ${newVersion}.`;
      tracking.done = true;
      return;
    }

    // 10. Generate thumbnail
    emit("Generating thumbnail...");
    const thumb = await generateThumbnail(rendered);

    // 11. Save complete version
    store.addVersion(sessionId, newVersion, {
      source: result.source,
      screenshot: rendered,
      thumb,
      prompt,
    });

    emit("Done");
    tracking.version = newVersion;
    tracking.done = true;
  } catch (err: any) {
    tracking.error = err.message ?? "Generation failed";
    tracking.done = true;
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsx --eval "import './server/generate-routes.ts'; console.log('generate routes OK')"`
Expected: `generate routes OK`

- [ ] **Step 3: Verify server starts**

Run: `npx tsx www/server.ts` (Ctrl+C after confirming startup message)
Expected: "Example Gen server running at http://localhost:3333"

- [ ] **Step 4: Commit**

```bash
git add server/generate-routes.ts
git commit -m "feat(refine): add generation route with SSE progress streaming"
```

---

### Task 10: Frontend — API Client

**Files:**
- Create: `www/refine/js/api.js`

- [ ] **Step 1: Create API client**

Create `www/refine/js/api.js`:

```javascript
/**
 * API client for the refinement loop.
 * All calls go to /api/refine/...
 */

const BASE = "/api/refine";

export async function createSession(name, platform, sourceAsset) {
  const res = await fetch(`${BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, platform, sourceAsset }),
  });
  return res.json();
}

export async function listSessions() {
  const res = await fetch(`${BASE}/sessions`);
  return res.json();
}

export async function getSession(id) {
  const res = await fetch(`${BASE}/sessions/${id}`);
  return res.json();
}

export async function updateSession(id, updates) {
  const res = await fetch(`${BASE}/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteSession(id) {
  const res = await fetch(`${BASE}/sessions/${id}`, { method: "DELETE" });
  return res.json();
}

export async function listVersions(sessionId) {
  const res = await fetch(`${BASE}/sessions/${sessionId}/versions`);
  return res.json();
}

export async function getVersion(sessionId, version) {
  const res = await fetch(`${BASE}/sessions/${sessionId}/versions/${version}`);
  return res.json();
}

export function getScreenshotUrl(sessionId, version) {
  return `${BASE}/sessions/${sessionId}/versions/${version}`;
}

export function getThumbUrl(sessionId, version) {
  // Thumbnails served as static files from sessions dir
  return `/sessions/${sessionId}/versions/${version}-thumb.png`;
}

export function getScreenshotFileUrl(sessionId, version) {
  return `/sessions/${sessionId}/versions/${version}-screenshot.png`;
}

export async function startGeneration(sessionId, annotations, overallFeedback, referencedVersions) {
  const res = await fetch(`${BASE}/sessions/${sessionId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ annotations, overallFeedback, referencedVersions }),
  });
  if (res.status === 409) throw new Error("Generation already in progress");
  return res.json();
}

/**
 * Subscribes to SSE generation events.
 * Returns an EventSource. Caller should handle:
 *   source.onmessage = (e) => { const data = JSON.parse(e.data); ... }
 */
export function subscribeToGeneration(sessionId) {
  return new EventSource(`${BASE}/sessions/${sessionId}/generate/events`);
}

export async function pickWinner(sessionId, winner) {
  const res = await fetch(`${BASE}/sessions/${sessionId}/pick`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ winner }),
  });
  return res.json();
}

export async function finalizeSession(sessionId) {
  const res = await fetch(`${BASE}/sessions/${sessionId}/finalize`, {
    method: "POST",
  });
  return res.json();
}

export async function saveWipAnnotations(sessionId, annotations, overallFeedback) {
  const res = await fetch(`${BASE}/sessions/${sessionId}/annotations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ annotations, overallFeedback }),
  });
  return res.json();
}

export async function getWipAnnotations(sessionId) {
  const res = await fetch(`${BASE}/sessions/${sessionId}/annotations/wip`);
  return res.json();
}

export async function getHistory(sessionId) {
  const res = await fetch(`${BASE}/sessions/${sessionId}/history`);
  return res.json();
}
```

- [ ] **Step 2: Commit**

```bash
git add www/refine/js/api.js
git commit -m "feat(refine): add frontend API client with SSE support"
```

---

### Task 11: Frontend — Sessions List Page

**Files:**
- Create: `www/refine/index.html`

- [ ] **Step 1: Create sessions list page**

Create `www/refine/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refinement Sessions — Example Gen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lato:wght@700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #09090b; color: #fafafa; padding: 2rem; max-width: 80rem; margin: 0 auto; }
    h1 { font-family: 'Lato', sans-serif; font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; }
    .subtitle { color: #71717a; margin-bottom: 2rem; }
    .toolbar { display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; }
    .toolbar a { color: #0fc8c3; text-decoration: none; font-size: 0.875rem; }
    .btn { background: #0fc8c3; color: #09090b; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.875rem; }
    .btn:hover { background: #0db5b0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
    .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; overflow: hidden; cursor: pointer; transition: border-color 0.2s; }
    .card:hover { border-color: #0fc8c3; }
    .card-thumb { width: 100%; height: 160px; background: #18181b; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .card-thumb .placeholder { color: #71717a; font-size: 0.875rem; }
    .card-body { padding: 1rem; }
    .card-body h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
    .card-meta { font-size: 0.75rem; color: #71717a; display: flex; gap: 0.75rem; }
    .badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.625rem; font-weight: 600; text-transform: uppercase; }
    .badge-active { background: rgba(15,200,195,0.15); color: #0fc8c3; }
    .badge-pending { background: rgba(212,197,32,0.15); color: #d4c520; }
    .badge-finalized { background: rgba(161,161,170,0.15); color: #a1a1aa; }

    /* New session dialog */
    .dialog-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; align-items: center; justify-content: center; }
    .dialog-overlay.open { display: flex; }
    .dialog { background: #18181b; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 1.5rem; width: 24rem; }
    .dialog h2 { font-size: 1.25rem; margin-bottom: 1rem; }
    .dialog label { display: block; font-size: 0.875rem; color: #a1a1aa; margin-bottom: 0.25rem; margin-top: 0.75rem; }
    .dialog input, .dialog select { width: 100%; background: #09090b; border: 1px solid rgba(255,255,255,0.1); color: #fafafa; padding: 0.5rem; border-radius: 0.375rem; font-size: 0.875rem; }
    .dialog-actions { display: flex; gap: 0.5rem; margin-top: 1.25rem; justify-content: flex-end; }
    .btn-secondary { background: transparent; color: #a1a1aa; border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="toolbar">
    <a href="/">&larr; Gallery</a>
  </div>
  <h1>Refinement Sessions</h1>
  <p class="subtitle">Iteratively refine generated assets with annotations and AI feedback</p>

  <div style="display:flex;gap:1rem;margin-bottom:1.5rem;align-items:center;flex-wrap:wrap;">
    <button class="btn" id="new-session-btn">+ New Session</button>
    <select id="filter-platform" style="background:#18181b;border:1px solid rgba(255,255,255,0.1);color:#fafafa;padding:0.375rem 0.5rem;border-radius:0.375rem;font-size:0.8125rem;">
      <option value="">All Platforms</option>
      <option value="nakkas">Nakkas</option>
      <option value="claude-svg">Claude SVG</option>
      <option value="recraft">Recraft</option>
      <option value="fal-ai">fal.ai</option>
      <option value="excalidraw">Excalidraw</option>
      <option value="stitch">Stitch</option>
    </select>
    <select id="filter-status" style="background:#18181b;border:1px solid rgba(255,255,255,0.1);color:#fafafa;padding:0.375rem 0.5rem;border-radius:0.375rem;font-size:0.8125rem;">
      <option value="">All Statuses</option>
      <option value="active">Active</option>
      <option value="pending">Pending</option>
      <option value="finalized">Finalized</option>
    </select>
  </div>

  <div class="grid" id="sessions-grid">
    <!-- Populated by JS -->
  </div>

  <!-- New Session Dialog -->
  <div class="dialog-overlay" id="dialog-overlay">
    <div class="dialog">
      <h2>New Refinement Session</h2>
      <label for="session-name">Session Name</label>
      <input type="text" id="session-name" placeholder="e.g. Hero Waveform v2">
      <label for="session-platform">Platform</label>
      <select id="session-platform">
        <option value="nakkas">Nakkas (SVG)</option>
        <option value="claude-svg">Claude SVG</option>
        <option value="recraft">Recraft</option>
        <option value="fal-ai">fal.ai</option>
        <option value="excalidraw">Excalidraw</option>
        <option value="stitch">Stitch</option>
      </select>
      <div class="dialog-actions">
        <button class="btn-secondary" id="dialog-cancel">Cancel</button>
        <button class="btn" id="dialog-create">Create</button>
      </div>
    </div>
  </div>

  <script type="module">
    import { listSessions, createSession, deleteSession } from '/refine/js/api.js';

    const grid = document.getElementById('sessions-grid');
    const dialog = document.getElementById('dialog-overlay');

    async function render() {
      let sessions = await listSessions();
      const platformFilter = document.getElementById('filter-platform').value;
      const statusFilter = document.getElementById('filter-status').value;
      if (platformFilter) sessions = sessions.filter(s => s.platform === platformFilter);
      if (statusFilter) sessions = sessions.filter(s => s.status === statusFilter);
      grid.innerHTML = sessions.map(s => `
        <div class="card" onclick="location.href='/refine/${s.id}'">
          <div class="card-thumb">
            ${s.currentChampion
              ? `<img src="/sessions/${s.id}/versions/${s.currentChampion}-thumb.png" loading="lazy">`
              : `<span class="placeholder">${s.platform}</span>`
            }
          </div>
          <div class="card-body">
            <h3>${s.name}</h3>
            <div class="card-meta">
              <span class="badge badge-${s.status}">${s.status}</span>
              <span>${s.platform}</span>
              <span>${s.versionCount} version${s.versionCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      `).join('') || '<p style="color:#71717a">No sessions yet. Click "+ New Session" to start.</p>';
    }

    document.getElementById('new-session-btn').onclick = () => dialog.classList.add('open');
    document.getElementById('dialog-cancel').onclick = () => dialog.classList.remove('open');
    document.getElementById('dialog-create').onclick = async () => {
      const name = document.getElementById('session-name').value.trim();
      const platform = document.getElementById('session-platform').value;
      if (!name) return;
      const session = await createSession(name, platform);
      dialog.classList.remove('open');
      location.href = `/refine/${session.id}`;
    };

    document.getElementById('filter-platform').onchange = render;
    document.getElementById('filter-status').onchange = render;
    render();
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add www/refine/index.html
git commit -m "feat(refine): add sessions list page"
```

---

### Task 12: Frontend — Annotation Canvas

**Files:**
- Create: `www/refine/js/annotation.js`

- [ ] **Step 1: Create annotation module**

Create `www/refine/js/annotation.js`:

```javascript
/**
 * Annotation canvas — DOM overlay for drawing green/red rectangles on images.
 *
 * Usage:
 *   const canvas = createAnnotationCanvas(imageElement, containerElement);
 *   canvas.onchange = (annotations) => { ... };
 *   canvas.setSentiment("positive" | "negative");
 *   canvas.getAnnotations(); // returns Annotation[]
 *   canvas.clear();
 *   canvas.destroy();
 */

let nextId = 1;

export function createAnnotationCanvas(imgEl, containerEl) {
  let sentiment = "positive";
  let annotations = [];
  let drawing = false;
  let startX = 0, startY = 0;
  let currentRect = null;
  let onchange = null;

  // Create overlay div
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;cursor:crosshair;z-index:10;";
  containerEl.style.position = "relative";
  containerEl.appendChild(overlay);

  function toPercent(clientX, clientY) {
    const rect = imgEl.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  }

  overlay.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    drawing = true;
    const p = toPercent(e.clientX, e.clientY);
    startX = p.x;
    startY = p.y;

    currentRect = document.createElement("div");
    const color = sentiment === "positive" ? "#22c55e" : "#ef4444";
    const fill = sentiment === "positive" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)";
    currentRect.style.cssText = `position:absolute;border:3px solid ${color};background:${fill};pointer-events:none;border-radius:2px;`;
    currentRect.dataset.sentiment = sentiment;
    overlay.appendChild(currentRect);
  });

  overlay.addEventListener("mousemove", (e) => {
    if (!drawing || !currentRect) return;
    const p = toPercent(e.clientX, e.clientY);
    const left = Math.min(startX, p.x);
    const top = Math.min(startY, p.y);
    const width = Math.abs(p.x - startX);
    const height = Math.abs(p.y - startY);
    currentRect.style.left = left + "%";
    currentRect.style.top = top + "%";
    currentRect.style.width = width + "%";
    currentRect.style.height = height + "%";
  });

  overlay.addEventListener("mouseup", (e) => {
    if (!drawing || !currentRect) return;
    drawing = false;
    const p = toPercent(e.clientX, e.clientY);
    const left = Math.min(startX, p.x);
    const top = Math.min(startY, p.y);
    const width = Math.abs(p.x - startX);
    const height = Math.abs(p.y - startY);

    // Ignore tiny rects (accidental clicks)
    if (width < 2 || height < 2) {
      currentRect.remove();
      currentRect = null;
      return;
    }

    const id = "ann-" + (nextId++);
    const ann = { id, x: left, y: top, width, height, sentiment: currentRect.dataset.sentiment, note: "" };

    // Show popover for note input
    showPopover(currentRect, ann, overlay);
    currentRect = null;
  });

  function showPopover(rectEl, ann, parent) {
    const popover = document.createElement("div");
    const rectBounds = rectEl.getBoundingClientRect();
    const parentBounds = parent.getBoundingClientRect();
    const relTop = rectBounds.top - parentBounds.top;
    const relLeft = rectBounds.left - parentBounds.left;

    // Position above rect, or below if near top
    const above = relTop > 40;
    popover.style.cssText = `
      position:absolute; z-index:20;
      left:${relLeft}px;
      ${above ? `top:${relTop - 36}px` : `top:${relTop + rectBounds.height + 4}px`};
      display:flex; gap:4px; align-items:center;
    `;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Add note (optional)";
    input.style.cssText = "background:#18181b;border:1px solid rgba(255,255,255,0.2);color:#fafafa;padding:4px 8px;border-radius:4px;font-size:13px;width:200px;";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "\u00d7";
    closeBtn.style.cssText = "background:none;border:none;color:#71717a;font-size:18px;cursor:pointer;padding:0 4px;";

    popover.appendChild(input);
    popover.appendChild(closeBtn);
    parent.appendChild(popover);
    input.focus();

    function save() {
      ann.note = input.value;
      annotations.push(ann);
      rectEl.style.pointerEvents = "auto";
      rectEl.style.cursor = "pointer";
      rectEl.dataset.annId = ann.id;

      // Add "x" delete button on hover
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "\u00d7";
      deleteBtn.style.cssText = "position:absolute;top:-8px;right:-8px;width:18px;height:18px;border-radius:50%;background:#ef4444;color:white;border:none;font-size:12px;cursor:pointer;display:none;z-index:15;line-height:1;padding:0;";
      rectEl.appendChild(deleteBtn);
      rectEl.addEventListener("mouseenter", () => { deleteBtn.style.display = "block"; });
      rectEl.addEventListener("mouseleave", () => { if (!rectEl.classList.contains("selected")) deleteBtn.style.display = "none"; });
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeAnnotation(ann.id);
      });

      // Click to select for keyboard deletion
      rectEl.addEventListener("click", (e) => {
        e.stopPropagation();
        if (rectEl.classList.contains("selected")) {
          rectEl.classList.remove("selected");
          rectEl.style.outline = "none";
        } else {
          rectEl.classList.add("selected");
          rectEl.style.outline = "2px dashed white";
        }
      });

      popover.remove();
      if (onchange) onchange(annotations);
    }

    function cancel() {
      rectEl.remove();
      popover.remove();
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") save();
      if (e.key === "Escape") cancel();
    });
    closeBtn.addEventListener("click", cancel);

    // Click outside saves
    setTimeout(() => {
      function outsideClick(e) {
        if (!popover.contains(e.target)) {
          save();
          document.removeEventListener("click", outsideClick, true);
        }
      }
      document.addEventListener("click", outsideClick, true);
    }, 100);
  }

  // Undo stack
  let undoStack = [];

  function removeAnnotation(annId) {
    annotations = annotations.filter(a => a.id !== annId);
    const el = overlay.querySelector(`[data-ann-id="${annId}"]`);
    if (el) el.remove();
    if (onchange) onchange(annotations);
  }

  // Keyboard shortcuts
  function handleKeyboard(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "g" || e.key === "G") { sentiment = "positive"; if (onchange) onchange(annotations); }
    if (e.key === "r" || e.key === "R") { sentiment = "negative"; if (onchange) onchange(annotations); }
    if (e.key === "Delete" || e.key === "Backspace") {
      const selected = overlay.querySelector(".selected");
      if (selected) {
        removeAnnotation(selected.dataset.annId);
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      // Undo last annotation
      if (annotations.length > 0) {
        const last = annotations[annotations.length - 1];
        removeAnnotation(last.id);
      }
    }
  }
  document.addEventListener("keydown", handleKeyboard);

  return {
    set onchange(fn) { onchange = fn; },
    get onchange() { return onchange; },
    setSentiment(s) { sentiment = s; },
    getSentiment() { return sentiment; },
    getAnnotations() { return [...annotations]; },
    setAnnotations(anns) {
      // Restore annotations from WIP
      clear();
      for (const ann of anns) {
        annotations.push(ann);
        const color = ann.sentiment === "positive" ? "#22c55e" : "#ef4444";
        const fill = ann.sentiment === "positive" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)";
        const rectEl = document.createElement("div");
        rectEl.style.cssText = `position:absolute;border:3px solid ${color};background:${fill};border-radius:2px;cursor:pointer;pointer-events:auto;left:${ann.x}%;top:${ann.y}%;width:${ann.width}%;height:${ann.height}%;`;
        rectEl.dataset.annId = ann.id;
        rectEl.addEventListener("click", (e) => {
          e.stopPropagation();
          rectEl.classList.toggle("selected");
          rectEl.style.outline = rectEl.classList.contains("selected") ? "2px dashed white" : "none";
        });
        overlay.appendChild(rectEl);
      }
    },
    clear() {
      annotations = [];
      overlay.querySelectorAll("div").forEach(el => el.remove());
    },
    destroy() {
      document.removeEventListener("keydown", handleKeyboard);
      overlay.remove();
    },
    getOverlay() { return overlay; },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add www/refine/js/annotation.js
git commit -m "feat(refine): add annotation canvas with DOM overlay"
```

---

### Task 13: Frontend — Comparison, Timeline, and Session Page

**Files:**
- Create: `www/refine/js/comparison.js`
- Create: `www/refine/js/timeline.js`
- Create: `www/refine/js/session.js`
- Create: `www/refine/session.html`

- [ ] **Step 1: Create comparison module**

Create `www/refine/js/comparison.js`:

```javascript
/**
 * Side-by-side comparison view.
 * Champion on left, challenger on right.
 */

export function createComparisonView(containerEl, championUrl, challengerUrl, championLabel, challengerLabel) {
  containerEl.innerHTML = `
    <div style="display:flex;gap:1.5rem;align-items:flex-start;">
      <div style="flex:1;text-align:center;">
        <div style="font-size:0.875rem;color:#a1a1aa;margin-bottom:0.5rem;">${championLabel}</div>
        <img src="${championUrl}" style="width:100%;height:auto;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.08);">
      </div>
      <div style="flex:1;text-align:center;">
        <div style="font-size:0.875rem;color:#a1a1aa;margin-bottom:0.5rem;">${challengerLabel}</div>
        <img src="${challengerUrl}" style="width:100%;height:auto;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.08);">
      </div>
    </div>
    <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.25rem;">
      <button class="btn" id="pick-champion">Pick Champion</button>
      <button class="btn-secondary" id="pick-tie">They're Equal</button>
      <button class="btn" id="pick-challenger">Pick Challenger</button>
    </div>
  `;

  return {
    onPick(callback) {
      document.getElementById("pick-champion").onclick = () => callback("champion");
      document.getElementById("pick-tie").onclick = () => callback("tie");
      document.getElementById("pick-challenger").onclick = () => callback("challenger");
    },
  };
}
```

- [ ] **Step 2: Create timeline module**

Create `www/refine/js/timeline.js`:

```javascript
/**
 * Timeline strip — horizontal thumbnails of all versions.
 * Supports inspect, compare-to-current, and reference actions.
 */

export function createTimeline(containerEl, versions, sessionId) {
  let onCompare = null;
  let onReference = null;

  function render() {
    containerEl.innerHTML = `
      <div style="display:flex;gap:0.75rem;overflow-x:auto;padding:0.5rem 0;">
        ${versions.map(v => `
          <div class="timeline-item" data-version="${v.version}" style="flex-shrink:0;width:120px;cursor:pointer;text-align:center;">
            <img src="/sessions/${sessionId}/versions/${v.version}-thumb.png"
                 loading="lazy"
                 style="width:120px;height:auto;border-radius:0.375rem;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:0.625rem;color:#71717a;margin-top:0.25rem;">${v.version}</div>
            <div style="display:flex;gap:0.25rem;justify-content:center;margin-top:0.25rem;">
              <button class="timeline-btn compare-btn" data-version="${v.version}" style="font-size:0.5625rem;color:#0fc8c3;background:none;border:1px solid rgba(15,200,195,0.3);border-radius:3px;padding:1px 4px;cursor:pointer;">Compare</button>
              <button class="timeline-btn ref-btn" data-version="${v.version}" style="font-size:0.5625rem;color:#d4c520;background:none;border:1px solid rgba(212,197,32,0.3);border-radius:3px;padding:1px 4px;cursor:pointer;">Reference</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    containerEl.querySelectorAll(".compare-btn").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (onCompare) onCompare(btn.dataset.version);
      };
    });

    containerEl.querySelectorAll(".ref-btn").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const version = btn.dataset.version;
        const note = prompt(`Reference from ${version}:`, "use the style from this version");
        if (note && onReference) onReference(version, note);
      };
    });

    // Click thumbnail to inspect full-size
    containerEl.querySelectorAll(".timeline-item").forEach(item => {
      item.querySelector("img").onclick = () => {
        showFullscreen(`/sessions/${sessionId}/versions/${item.dataset.version}-screenshot.png`, item.dataset.version);
      };
    });
  }

  function showFullscreen(url, label) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;";
    overlay.innerHTML = `
      <div style="color:#71717a;font-size:0.875rem;margin-bottom:1rem;">${label} — click or press Escape to close</div>
      <img src="${url}" style="max-width:90vw;max-height:85vh;border-radius:0.5rem;">
    `;
    overlay.onclick = () => overlay.remove();
    const handleKey = (e) => { if (e.key === "Escape") { overlay.remove(); document.removeEventListener("keydown", handleKey); } };
    document.addEventListener("keydown", handleKey);
    document.body.appendChild(overlay);
  }

  render();

  return {
    set onCompare(fn) { onCompare = fn; },
    set onReference(fn) { onReference = fn; },
    update(newVersions) { versions = newVersions; render(); },
  };
}
```

- [ ] **Step 3: Create session page orchestrator**

Create `www/refine/js/session.js`:

```javascript
/**
 * Session page orchestrator — ties annotation, comparison, and timeline together.
 * Manages phase transitions: annotation → generation → comparison → annotation loop.
 */
import { createAnnotationCanvas } from './annotation.js';
import { createComparisonView } from './comparison.js';
import { createTimeline } from './timeline.js';
import * as api from './api.js';

const sessionId = location.pathname.split('/').pop();
let session = null;
let canvas = null;
let timeline = null;
let referencedVersions = [];

// DOM elements
const mainArea = document.getElementById('main-area');
const toolbar = document.getElementById('toolbar');
const feedbackEl = document.getElementById('feedback');
const timelineEl = document.getElementById('timeline');
const statusEl = document.getElementById('status');
const generateBtn = document.getElementById('generate-btn');
const finalizeBtn = document.getElementById('finalize-btn');
const sentimentIndicator = document.getElementById('sentiment-indicator');

async function init() {
  session = await api.getSession(sessionId);
  document.getElementById('session-name').textContent = session.name;
  document.getElementById('session-platform').textContent = session.platform;

  if (session.status === "finalized") {
    statusEl.textContent = "Finalized";
    toolbar.style.display = "none";
    generateBtn.style.display = "none";
  }

  if (session.currentChampion) {
    showAnnotationPhase();
  } else {
    mainArea.innerHTML = '<p style="color:#71717a;text-align:center;padding:4rem;">No versions yet. Use the gallery to start refining an existing asset, or generate from scratch.</p>';
  }

  await loadTimeline();
  await loadWipAnnotations();
}

async function showAnnotationPhase() {
  toolbar.style.display = "flex";
  generateBtn.style.display = "inline-flex";
  generateBtn.disabled = false;
  generateBtn.textContent = "Generate Next";

  mainArea.innerHTML = `
    <div id="image-container" style="position:relative;display:inline-block;width:100%;">
      <img id="champion-img" src="/sessions/${sessionId}/versions/${session.currentChampion}-screenshot.png"
           style="width:100%;height:auto;border-radius:0.5rem;">
    </div>
  `;

  const imgEl = document.getElementById('champion-img');
  const containerEl = document.getElementById('image-container');

  // Wait for image to load before creating canvas
  await new Promise(resolve => {
    if (imgEl.complete) resolve();
    else imgEl.onload = resolve;
  });

  if (canvas) canvas.destroy();
  canvas = createAnnotationCanvas(imgEl, containerEl);
  canvas.onchange = (anns) => {
    // Auto-save WIP
    api.saveWipAnnotations(sessionId, anns, feedbackEl.value);
  };

  updateSentimentIndicator();
}

function showComparisonPhase(challengerVersion) {
  toolbar.style.display = "none";
  generateBtn.style.display = "none";
  if (canvas) { canvas.destroy(); canvas = null; }

  const champUrl = `/sessions/${sessionId}/versions/${session.currentChampion}-screenshot.png`;
  const challUrl = `/sessions/${sessionId}/versions/${challengerVersion}-screenshot.png`;

  const comp = createComparisonView(
    mainArea,
    champUrl, challUrl,
    `Current Champion ${session.currentChampion}`,
    `Challenger ${challengerVersion}`
  );

  comp.onPick(async (winner) => {
    await api.pickWinner(sessionId, winner);
    session = await api.getSession(sessionId);
    referencedVersions = [];
    feedbackEl.value = "";
    await loadTimeline();
    showAnnotationPhase();
  });
}

async function loadTimeline() {
  const versions = await api.listVersions(sessionId);
  timeline = createTimeline(timelineEl, versions, sessionId);
  timeline.onCompare = (version) => {
    showComparisonPhase(version);
  };
  timeline.onReference = (version, note) => {
    referencedVersions.push({ version, note });
    statusEl.textContent = `Referenced ${version}: "${note}"`;
  };
}

async function loadWipAnnotations() {
  const wip = await api.getWipAnnotations(sessionId);
  if (wip && wip.annotations.length > 0 && canvas) {
    canvas.setAnnotations(wip.annotations);
    if (wip.overallFeedback) feedbackEl.value = wip.overallFeedback;
  }
}

function updateSentimentIndicator() {
  if (!canvas) return;
  const s = canvas.getSentiment();
  sentimentIndicator.textContent = s === "positive" ? "Like (G)" : "Dislike (R)";
  sentimentIndicator.style.color = s === "positive" ? "#22c55e" : "#ef4444";
}

// ── Event handlers ───────────────────────────────────────────────────

generateBtn.addEventListener("click", async () => {
  if (!canvas) return;
  const annotations = canvas.getAnnotations();
  const overallFeedback = feedbackEl.value.trim();

  if (annotations.length === 0 && !overallFeedback) {
    statusEl.textContent = "Add annotations or feedback first";
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span class="spinner"></span> Generating...';
  mainArea.style.filter = "blur(2px)";
  statusEl.textContent = "Starting generation...";

  try {
    await api.startGeneration(sessionId, annotations, overallFeedback, referencedVersions.length > 0 ? referencedVersions : undefined);

    const source = api.subscribeToGeneration(sessionId);
    source.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "progress") {
        statusEl.textContent = data.message;
      } else if (data.type === "done") {
        source.close();
        mainArea.style.filter = "none";
        session = await api.getSession(sessionId);
        await loadTimeline();
        showComparisonPhase(data.version);
      } else if (data.type === "error") {
        source.close();
        mainArea.style.filter = "none";
        statusEl.innerHTML = `<span style="color:#ef4444;">${data.message}</span> <button class="btn" onclick="location.reload()" style="margin-left:0.5rem;font-size:0.75rem;">Retry</button>`;
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Next";
      }
    };
    source.onerror = () => {
      source.close();
      mainArea.style.filter = "none";
      statusEl.innerHTML = '<span style="color:#ef4444;">Connection lost</span> <button class="btn" onclick="location.reload()" style="margin-left:0.5rem;font-size:0.75rem;">Retry</button>';
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Next";
    };
  } catch (err) {
    mainArea.style.filter = "none";
    statusEl.textContent = err.message;
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Next";
  }
});

finalizeBtn.addEventListener("click", async () => {
  if (!confirm("Export the current champion to the output directory?")) return;
  const result = await api.finalizeSession(sessionId);
  statusEl.textContent = `Exported to ${result.exportedTo}`;
  session = await api.getSession(sessionId);
  toolbar.style.display = "none";
  generateBtn.style.display = "none";
});

// Sentiment toggle buttons
document.getElementById("btn-positive").addEventListener("click", () => {
  if (canvas) canvas.setSentiment("positive");
  updateSentimentIndicator();
});
document.getElementById("btn-negative").addEventListener("click", () => {
  if (canvas) canvas.setSentiment("negative");
  updateSentimentIndicator();
});
document.getElementById("btn-undo").addEventListener("click", () => {
  if (canvas) {
    const anns = canvas.getAnnotations();
    if (anns.length > 0) {
      const last = anns[anns.length - 1];
      // Simulate Ctrl+Z
      const event = new KeyboardEvent("keydown", { key: "z", ctrlKey: true });
      document.dispatchEvent(event);
    }
  }
});
document.getElementById("btn-clear").addEventListener("click", () => {
  if (canvas) canvas.clear();
  statusEl.textContent = "Annotations cleared";
});

// Keyboard shortcuts for sentiment
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.key === "g" || e.key === "G") { if (canvas) canvas.setSentiment("positive"); updateSentimentIndicator(); }
  if (e.key === "r" || e.key === "R") { if (canvas) canvas.setSentiment("negative"); updateSentimentIndicator(); }
});

// Auto-save feedback on change
feedbackEl.addEventListener("input", () => {
  if (canvas) {
    api.saveWipAnnotations(sessionId, canvas.getAnnotations(), feedbackEl.value);
  }
});

init();
```

- [ ] **Step 4: Create session page HTML**

Create `www/refine/session.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refinement — Example Gen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lato:wght@700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #09090b; color: #fafafa; padding: 1.5rem; max-width: 80rem; margin: 0 auto; }
    a { color: #0fc8c3; text-decoration: none; }
    .header { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1rem; }
    .header h1 { font-family: 'Lato', sans-serif; font-size: 1.5rem; font-weight: 700; }
    .header .platform-badge { font-size: 0.75rem; color: #71717a; background: rgba(255,255,255,0.05); padding: 0.125rem 0.5rem; border-radius: 999px; }
    .btn { background: #0fc8c3; color: #09090b; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 0.375rem; }
    .btn:hover { background: #0db5b0; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: transparent; color: #a1a1aa; border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; }
    .btn-danger { background: transparent; color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; }
    .toolbar { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; padding: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.06); }
    .toolbar .sep { width: 1px; height: 1.5rem; background: rgba(255,255,255,0.1); }
    .sentiment-btn { padding: 0.375rem 0.75rem; border-radius: 0.375rem; border: 1px solid rgba(255,255,255,0.1); background: none; color: #fafafa; cursor: pointer; font-size: 0.8125rem; }
    .sentiment-btn:hover { background: rgba(255,255,255,0.05); }
    #main-area { margin-bottom: 1rem; min-height: 200px; }
    #feedback { width: 100%; background: #18181b; border: 1px solid rgba(255,255,255,0.1); color: #fafafa; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; font-family: 'Inter', sans-serif; resize: vertical; min-height: 3rem; margin-bottom: 0.75rem; }
    .actions { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem; }
    #status { font-size: 0.8125rem; color: #71717a; margin-left: auto; }
    #timeline { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.75rem; margin-top: 1rem; }
    .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #09090b; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div style="margin-bottom:1rem;font-size:0.875rem;"><a href="/refine">&larr; Sessions</a></div>

  <div class="header">
    <h1 id="session-name">Loading...</h1>
    <span class="platform-badge" id="session-platform"></span>
  </div>

  <div class="toolbar" id="toolbar">
    <button class="sentiment-btn" id="btn-positive" style="color:#22c55e;border-color:rgba(34,197,94,0.3);">Like (G)</button>
    <button class="sentiment-btn" id="btn-negative" style="color:#ef4444;border-color:rgba(239,68,68,0.3);">Dislike (R)</button>
    <div class="sep"></div>
    <span id="sentiment-indicator" style="font-size:0.75rem;color:#22c55e;">Like (G)</span>
    <div class="sep"></div>
    <button class="sentiment-btn" id="btn-undo">Undo</button>
    <button class="sentiment-btn" id="btn-clear">Clear All</button>
  </div>

  <div id="main-area"></div>

  <textarea id="feedback" placeholder="Overall feedback (e.g. 'too busy, simplify the layout')"></textarea>

  <div class="actions">
    <button class="btn" id="generate-btn">Generate Next</button>
    <button class="btn-secondary" id="finalize-btn">Finalize</button>
    <span id="status"></span>
  </div>

  <div id="timeline"></div>

  <script type="module" src="/refine/js/session.js"></script>
</body>
</html>
```

- [ ] **Step 5: Commit**

```bash
git add www/refine/js/comparison.js www/refine/js/timeline.js www/refine/js/session.js www/refine/session.html
git commit -m "feat(refine): add comparison, timeline, and session page UI"
```

---

### Task 14: Gallery Integration

**Files:**
- Modify: `www/index.html`

- [ ] **Step 1: Add Refine link and per-asset Refine buttons to gallery**

In `www/index.html`, add two things:

**A) Navigation link** — Add right after the opening `<body>` content (the title/subtitle area), before the platform sections:

```html
<div style="display:flex;gap:1rem;margin-bottom:2rem;">
  <a href="/refine" style="display:inline-flex;align-items:center;gap:0.5rem;background:#0fc8c3;color:#09090b;padding:0.5rem 1rem;border-radius:0.5rem;font-weight:600;text-decoration:none;font-size:0.875rem;">
    Refinement Sessions &rarr;
  </a>
</div>
```

**B) Per-asset Refine buttons** — Add a script at the bottom of `www/index.html` that adds a "Refine" button to every asset card link. The existing gallery has `<a>` tags linking to preview pages. Add a small "Refine" button next to each that creates a session and navigates to it:

```html
<script type="module">
  // Add "Refine" buttons to all asset links in the gallery
  document.querySelectorAll('.card').forEach(card => {
    const link = card.querySelector('a');
    if (!link) return;
    // Extract platform from section heading
    const section = card.closest('section') || card.closest('[data-platform]');
    const heading = section?.querySelector('h2')?.textContent?.toLowerCase() || '';
    let platform = 'nakkas';
    if (heading.includes('nakkas')) platform = 'nakkas';
    else if (heading.includes('recraft')) platform = 'recraft';
    else if (heading.includes('fal')) platform = 'fal-ai';
    else if (heading.includes('excalidraw')) platform = 'excalidraw';
    else if (heading.includes('stitch')) platform = 'stitch';
    else platform = 'claude-svg';

    const refineBtn = document.createElement('button');
    refineBtn.textContent = 'Refine';
    refineBtn.style.cssText = 'background:rgba(15,200,195,0.15);color:#0fc8c3;border:1px solid rgba(15,200,195,0.3);padding:2px 8px;border-radius:4px;font-size:0.6875rem;cursor:pointer;margin-left:auto;';
    refineBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Determine the asset file path from the link href
      const href = link.getAttribute('href') || '';
      const name = href.split('/').pop()?.replace(/\.[^.]+$/, '') || 'Untitled';
      const res = await fetch('/api/refine/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `Refine ${name}`, platform, sourceAsset: href }),
      });
      const session = await res.json();
      location.href = `/refine/${session.id}`;
    };
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.appendChild(refineBtn);
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add www/index.html
git commit -m "feat(refine): add refinement link to gallery page"
```

---

### Task 15: Static File Serving Fix for Sessions

**Files:**
- Modify: `www/server.ts`

The session screenshots and thumbnails are stored in `sessions/` under the project root. The Hono static file middleware needs to serve these. The existing `serveStatic({ root: ROOT })` catch-all should already handle this since `sessions/` is under `ROOT` (the `example_gen/` directory). Verify this works.

- [ ] **Step 1: Verify the server starts and serves session files**

Run: `npx tsx www/server.ts`

Then in another terminal:
```bash
# Create a test session via the API
curl -X POST http://localhost:3333/api/refine/sessions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","platform":"nakkas"}'
```

Expected: JSON response with session ID

```bash
# List sessions
curl http://localhost:3333/api/refine/sessions
```

Expected: JSON array with the test session

```bash
# Check the sessions list page
curl -s http://localhost:3333/refine | head -5
```

Expected: HTML starting with `<!DOCTYPE html>`

- [ ] **Step 2: Verify the refine JS files are served**

```bash
curl -s http://localhost:3333/refine/js/api.js | head -3
```

Expected: JavaScript starting with `/**`

- [ ] **Step 3: Commit** (only if fixes were needed)

```bash
git add www/server.ts
git commit -m "fix(refine): ensure static files serve correctly for sessions"
```

---

### Task 16: End-to-End Smoke Test

- [ ] **Step 1: Start the server**

```bash
npx tsx www/server.ts &
```

- [ ] **Step 2: Create a session from an existing Nakkas asset**

```bash
# Find an existing Nakkas SVG
ls nakkas/*.svg | head -1

# Create session pointing to it (replace path with actual file)
curl -X POST http://localhost:3333/api/refine/sessions \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test","platform":"nakkas","sourceAsset":"nakkas/nakkas-ad-banner.svg"}'
```

Expected: Session with `status: "active"`, `currentChampion: "v1"`, `versionCount: 1`

- [ ] **Step 3: Verify the session page loads**

Open `http://localhost:3333/refine` in a browser.
Expected: See the "Smoke Test" session card. Click it to open the refinement view.
Expected: See the champion image with annotation overlay ready.

- [ ] **Step 4: Test annotation + generation** (requires `OPENAI_API_KEY` in env)

In the browser:
1. Draw a green rectangle on part of the image
2. Draw a red rectangle on another part
3. Type feedback in the text area
4. Click "Generate Next"

Expected: Progress messages appear ("Preparing prompt...", "Generating with OpenAI...", etc.)
Expected: After completion, side-by-side comparison appears

- [ ] **Step 5: Test pick winner**

Click "Pick Challenger" (or Champion).
Expected: Returns to annotation phase with the winner as new champion.
Expected: Timeline strip shows both versions.

- [ ] **Step 6: Run all unit tests**

```bash
npx vitest run
```

Expected: All tests PASS

- [ ] **Step 7: Commit any final fixes**

```bash
git add -A
git commit -m "feat(refine): complete refinement loop MVP"
```

---

## Dependency Graph

```
Task 1 (setup)
  └→ Task 2 (types)
       ├→ Task 3 (session store)
       ├→ Task 4 (compositor)
       ├→ Task 5 (renderer)
       └→ Task 6 (nakkas adapter)
            └→ Task 7 (hono server skeleton)
                 └→ Task 8 (session routes)
                 └→ Task 9 (generate routes)
                      └→ Task 10 (frontend API client)
                           └→ Task 11 (sessions list page)
                           └→ Task 12 (annotation canvas)
                           └→ Task 13 (comparison + timeline + session page)
                                └→ Task 14 (gallery integration)
                                └→ Task 15 (static file serving verification)
                                     └→ Task 16 (end-to-end smoke test)
```

Tasks 3, 4, 5, 6 can run in parallel after Task 2.
Tasks 10, 11, 12 can run in parallel after Task 9.
