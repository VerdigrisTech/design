import { load as loadHtml } from "cheerio";
import type { Artifact, Rule } from "./types.js";

const TYPE_NAMESPACES: Record<Artifact["type"], string[]> = {
  slides: ["composition.persuade-pitch", "composition.slides"],
  "one-pagers": ["composition.one-pager"],
};

function deriveType(filePath: string): Artifact["type"] {
  const norm = filePath.replaceAll("\\", "/");
  if (norm.includes("categories/slides/examples/")) return "slides";
  if (norm.includes("categories/one-pagers/examples/")) return "one-pagers";
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
  const typeNamespaces = TYPE_NAMESPACES[a.type];
  return rules.filter((r) => {
    const typePrefixed = [
      "composition.persuade-pitch",
      "composition.persuade-whitepaper",
      "composition.slides",
      "composition.one-pager",
      "composition.case-study",
      "composition.whitepaper-body",
    ];
    const matchedTypePrefix = typePrefixed.find((p) =>
      r.id.startsWith(p + ".")
    );
    if (matchedTypePrefix && !typeNamespaces.includes(matchedTypePrefix))
      return false;
    if (r.modes && r.modes.length > 0 && !r.modes.includes(a.genre))
      return false;
    return true;
  });
}
