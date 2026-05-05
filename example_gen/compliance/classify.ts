import { load as loadHtml } from "cheerio";
import type { Artifact, Rule } from "./types.js";

// Cells in rules/visual-rules.yml that are bound to a specific artifact medium.
// A rule whose id starts with one of these prefixes only applies to artifacts of
// the medium it was authored for. Rules outside this set (e.g. composition.matrix,
// composition.visual-signature, composition.canvas-text, color.*, typography.*,
// spacing.*, accessibility.*) are cross-cutting and apply to every artifact.
const ARTIFACT_BOUND_CELLS = [
  "composition.persuade-slide-deck",
  "composition.inform-slide-deck",
  "composition.persuade-one-pager",
  "composition.persuade-whitepaper-cover",
  "composition.persuade-whitepaper-body",
  "composition.persuade-case-study",
  "composition.persuade-web-page",
  "composition.inform-web-page",
  "composition.demonstrate-web-page",
  "composition.convert-web-page",
  "composition.narrate-web-page",
  "composition.persuade-ad-banner",
  "composition.identify-ad-banner",
  "composition.persuade-email",
  "composition.analyze-dashboard",
  "composition.identify-hardware",
  "composition.assist-chat",
  "composition.assist-embedded",
  "composition.instruct-machine",
];

const TYPE_TO_CELLS: Record<Artifact["type"], string[]> = {
  slides: [
    "composition.persuade-slide-deck",
    "composition.inform-slide-deck",
  ],
  "one-pagers": [
    "composition.persuade-one-pager",
  ],
};

function deriveType(filePath: string): Artifact["type"] {
  const norm = filePath.replaceAll("\\", "/");
  // Test fixtures live under tests/compliance/fixtures/{passing,seeded-failures}/{slides,one-pagers}/*.html.
  // Detect type from the parent directory; default to slides if unspecified.
  if (norm.includes("tests/compliance/fixtures/") && norm.endsWith(".html")) {
    if (norm.includes("/slides/")) return "slides";
    if (norm.includes("/one-pagers/")) return "one-pagers";
    return "slides";
  }
  if (norm.includes("categories/slides/examples/") && norm.endsWith(".html")) return "slides";
  if (norm.includes("categories/one-pagers/examples/") && norm.endsWith(".html")) return "one-pagers";
  throw new Error(`unsupported path for v0.1: ${filePath}`);
}

export function classifyArtifact(
  filePath: string,
  html: string
): Artifact {
  const $ = loadHtml(html);
  const body = $("body").first();
  const genreRaw = body.attr("data-genre");
  if (!genreRaw) throw new Error(`${filePath}: <body data-genre="..."> required`);
  const genre = genreRaw.replaceAll("-", "_");
  const confidentiality = body.attr("data-confidentiality");
  return {
    path: filePath,
    type: deriveType(filePath),
    genre,
    confidentiality,
    html,
  };
}

export function applicableRules(rules: Rule[], a: Artifact): Rule[] {
  const allowedCells = TYPE_TO_CELLS[a.type];
  return rules.filter((r) => {
    // If the rule is owned by an artifact-bound cell that doesn't match this
    // artifact's medium, exclude it. Cross-cutting rules (color, typography,
    // composition.matrix, composition.visual-signature, etc.) carry no medium
    // prefix and pass through.
    const matchedCell = ARTIFACT_BOUND_CELLS.find((p) => r.id.startsWith(p + "."));
    if (matchedCell && !allowedCells.includes(matchedCell)) return false;
    if (r.modes && r.modes.length > 0 && !r.modes.includes(a.genre)) return false;
    return true;
  });
}
