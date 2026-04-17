---
layout: default
title: Video
---

# Video

How Verdigris surfaces video. Covers the invariant accessibility requirements, the production workflow that keeps render costs bounded, the technical specs we inherit from established industry standards, the integration pattern for consuming design tokens inside Remotion, and the open questions we are deliberately NOT codifying yet.

The Verdigris Remotion work lives in the [verdigris www repo](https://github.com/VerdigrisTech/verdigris). This foundation defines the constraints; the compositions live there.

## Invariants

These are non-negotiable. Every Verdigris video must satisfy them.

- **Captions are mandatory.** Every published video ships with an SRT file. Audio-only is not accessible, and platform algorithms increasingly prioritize captioned content.
- **Text contrast meets WCAG AA minimum.** On-screen text against its backing region must meet 4.5:1 for body text, 3:1 for large text. Video backgrounds are often complex (data visualizations, motion), so plates or drop shadows are frequently required.
- **A reduced-motion alternative exists.** Users with `prefers-reduced-motion` cannot be blocked from the content. Options: a static key frame with the transcript, an audio-only version, or a low-motion edit. Simply omitting motion is not sufficient if the video carries information through motion.
- **Critical content stays within title-safe area.** 10% inset from all edges. Applies to anything a viewer must read or see: headline text, captions, data labels, logos. Broadcast legacy, but still relevant because social platforms overlay UI chrome on the edges.

## Production workflow

Iterate in the preview server. Render only for publish. This is the highest-leverage cost control available in Remotion.

- **Studio for design iteration.** Run `npx remotion studio` locally. Scrub any frame, any time. Design review happens here, not by rendering video.
- **Stills for design review.** Use `npx remotion still` to export key frames as PNG for stakeholder review, Figma embedding, and approval gates. A still render is a fraction of the cost of a video render.
- **Storyboard before motion.** For any video longer than 15 seconds, produce still frames for each major beat and get design approval on those stills BEFORE building motion. Motion is expensive to iterate; composition is cheap to iterate on stills.
- **One render per publish-ready version.** Full video renders happen at approval checkpoints, not during design review. If design review is happening correctly (in studio + on stills), the first render is the publish render.
- **CI renders on tagged release only, not per-PR.** Unbounded per-PR rendering budgets blow up fast. A tagged release triggers the render; PR review happens on stills and studio preview links.
- **Dev resolution lower than publish.** Dev previews run at 720p/30fps. Publish renders at target resolution. `remotion.config.ts` enforces this split.

Render economics reference: Remotion Lambda charges $0.0000166667/GB-s. A 60-second 1080p render is roughly $0.10-0.30 per pass. A 2-minute 4K render can exceed $2. Iterating by rendering is financially viable for a handful of videos, financially ruinous for a team's worth of weekly work.

## Technical specs

We follow established industry standards rather than inventing our own. Where multiple valid standards exist, we explicitly choose one.

**Frame rates:**
- 30 fps: default for web and social
- 24 fps: cinematic narrative pieces (founder interviews, brand films)
- 60 fps: smooth motion (screen recordings, data animation, UI demos)

**Aspect ratios by platform (platform canonical, not our invention):**
- 16:9 (1920x1080): YouTube, website embeds, presentations
- 9:16 (1080x1920): Instagram Reels, TikTok, YouTube Shorts, LinkedIn feed video
- 1:1 (1080x1080): Instagram feed (legacy), cross-platform-safe
- 4:5 (1080x1350): LinkedIn feed, maximizes feed real estate

**Resolution:**
- Publish minimum: 1920x1080 (HD)
- 4K (3840x2160): hero and feature pieces only, due to render cost

**Export format:**
- H.264 MP4 for web and social delivery (universal support)
- ProRes for archival masters and handoff to video editors
- WebM for Verdigris-owned embeds where file size matters more than compatibility

**Audio levels:**
- Platform dependent. YouTube and Spotify normalize to -14 LUFS. EBU R128 standard is -23 LUFS. Web streaming typically lands around -16 LUFS.
- We target -14 LUFS integrated for anything delivered to YouTube, Spotify, or other major platforms. For web embeds, -16 LUFS.
- Reference: [EBU R128 Loudness Recommendation](https://tech.ebu.ch/publications/r128), [YouTube loudness guidelines](https://www.youtube.com/howyoutubeworks/user-settings/sound-quality/).

**Color space:**
- Rec. 709 for video output (sRGB equivalent for most purposes). Our OKLch source tokens convert cleanly to Rec. 709 via sRGB.

**Caption sizing:**
- Minimum 1/20 of frame height for on-screen captions. At 1080p, that is 54px.
- Reference: [BBC Subtitle Guidelines](https://bbc.github.io/subtitle-guidelines/).

**Safe areas:**
- Title-safe: 10% inset from all edges. Critical text and data labels must stay within.
- Action-safe: 5% inset. Non-critical visual elements.
- Broadcast legacy but still applicable because social platforms overlay UI on the edges.

## Consuming design tokens in Remotion

Remotion compositions are React components. The design system package exports three useful forms:

**1. Hex colors as typed JavaScript constants** (`@verdigristech/design-tokens`):

```tsx
import { hexColors } from '@verdigristech/design-tokens';

const teal = hexColors['color.brand.verdigris']; // '#0fc8c3'
const neutral950 = hexColors['color.neutral.950']; // '#09090b'
```

This is the primary path for programmatic color access in compositions. Remotion's `interpolateColors()` and CSS prop values both accept hex.

**2. Raw JSON tokens via subpath exports** (`@verdigristech/design-tokens/tokens/*`):

Motion, spacing, typography, and other non-color tokens are not in the JS export today. Import them directly from the package's `tokens/` directory:

```tsx
import duration from '@verdigristech/design-tokens/tokens/motion/duration.json';
import easing from '@verdigristech/design-tokens/tokens/motion/easing.json';

const fastMs = parseInt(duration.duration.fast.$value); // 150
const easingOut = easing.easing.out.$value; // 'ease-out'
```

Note: JSON token files use W3C DTCG format with `$value` wrapping. Extract the value before using.

**3. CSS variables for styled layers** (`@verdigristech/design-tokens/css/oklch`):

For Remotion components that use regular CSS styling, import the variables sheet once and reference tokens via `var(--color-brand-verdigris)` etc. Useful when a Remotion layer uses standard DOM styling rather than Canvas or programmatic color.

**Remotion-specific token gaps to track:**

- Motion duration tokens are in milliseconds; Remotion's `interpolate` wants frame counts. Convert: `frames = ms / 1000 * fps`.
- Easing tokens are CSS `cubic-bezier()` strings; Remotion's `Easing.bezier()` takes four numeric arguments. A helper to parse the tokens would be useful; if you need it, file an issue on the design system repo.
- We don't currently export typography sizes as JS. Use hex and motion for now; typography Remotion integration is a graduation item once we know what's needed.

## Storyboard convention (proposed)

Pre-production design review is the highest cost lever, more than render discipline. We propose (but do not yet enforce):

- Any video longer than 15 seconds gets a storyboard. Figma frames are fine; hand sketches scanned as images are fine; `remotion still` exports of placeholder compositions are fine.
- Storyboards cover major beats: opening, each scene, transitions, closing. Timing is approximate.
- Design review on storyboard happens before motion is built. Stakeholders approve (or reject) the composition, text, and sequence.
- Motion is built only against approved storyboards. Disagreements discovered during motion are expensive.
- Once motion is built, review happens in Remotion Studio with a shareable link. No rendering for review.

This is `maturity: experimental` for now. Will graduate when we have evidence from 2-3 real productions that it reduces iteration cost.

## Open questions (Verdigris-specific, not yet codified)

The following are NOT rules. They are areas where the right answer depends on Verdigris brand context that we have not yet resolved through real production. Do not prescribe. Do not codify. Experiment in real compositions, document what works, graduate the patterns that hold.

**Scene rhythm.** Is Verdigris a slow-burn-deliberate voice, or does "if you know, you know" reward faster pattern-recognition edits? Both interpretations are defensible. Real productions will tell.

**Visual signature in motion.** The Lissajous, spectrogram, and harmonic spectrum exist as static and interactive elements. Which become video-native? How do they rhyme with the brand rather than feel like decoration? Probably the answer involves real data driving the motion rather than simulated data animating stylistically. Confirm with real work.

**Opening identity.** Social algorithms reward fast brand recognition; the brand's data-first principle suggests NOT leading with a logo. These tensions are real. Resolve per-video based on platform and audience; watch for patterns that emerge.

**Closing identity.** Previous exploration (Lissajous-to-logo) was rejected. "Data becomes brand" as an animation metaphor reads as gimmicky. Candidate direction: brand wordmark appears alongside a held data moment, not emerging from it. Or: held stillness with clean endcard. Validate in real productions before codifying.

**Voice in audio.** Competence-driven brand voice translates to specific audio choices: register, pace, hedging. The earlier spoken-voice framework exploration established a direction, but we have not yet produced narrated video. First 2-3 narrated pieces will reveal whether the direction holds.

**Data-driven motion.** Real 8 kHz data animating within a video is the strongest potential brand signal, and the hardest to deliver. Depends on data pipeline (see [ClickHouse access](https://github.com/VerdigrisTech/verdigris)) and on how data is sampled, filtered, and mapped to motion. Expect this to evolve substantially as we try it.

## Graduation path

Work happens in the Verdigris Remotion project (www repo). When a pattern proves itself across 2-3 productions, it graduates back here:

1. Candidate pattern noted in the Remotion repo's README or video README
2. After 2-3 confirmatory uses, a PR to this design system repo proposes the pattern as `maturity: experimental` in `rules/visual-rules.yml`
3. After 30 days without surfaced violations or stakeholder objections, the rule graduates to `maturity: rule`
4. The pattern also appears as a specimen in `categories/video/` (when that category exists)

Demotion applies: anything can move down if a later production surfaces problems. Not failure, just honest response to learning.

## References

- [Remotion documentation](https://www.remotion.dev/docs/)
- [EBU R128 Loudness Recommendation](https://tech.ebu.ch/publications/r128)
- [BBC Subtitle Guidelines](https://bbc.github.io/subtitle-guidelines/)
- [W3C Media Accessibility User Requirements](https://www.w3.org/TR/media-accessibility-reqs/)
- Companion foundation: [Motion](motion) (web-oriented motion, shared principles)
- Companion foundation: [Accessibility](accessibility)
