/**
 * Design token build pipeline.
 *
 * Reads W3C DTCG token JSON from tokens/, resolves references,
 * and generates multi-format outputs in build/dist/.
 *
 * Formats:
 *   - css/oklch.css   — OKLch CSS custom properties (Patina, modern browsers)
 *   - css/hsl.css     — HSL CSS custom properties (www legacy)
 *   - hex/colors.json — Hex color values (email, print, Figma)
 *   - tailwind/preset.js — Tailwind CSS preset
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TOKENS = join(ROOT, "tokens");
const DIST = join(__dirname, "dist");

// --- Token loading ---

interface Token {
  $value: string | number;
  $type?: string;
  $description?: string;
}

type TokenGroup = { [key: string]: Token | TokenGroup | string };

function loadJson(path: string): TokenGroup {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function isToken(obj: unknown): obj is Token {
  return typeof obj === "object" && obj !== null && "$value" in obj;
}

/** Flatten nested token groups into dot-separated paths */
function flattenTokens(
  obj: TokenGroup,
  prefix = "",
  result: Map<string, Token> = new Map()
): Map<string, Token> {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (isToken(val)) {
      result.set(path, val);
    } else if (typeof val === "object" && val !== null) {
      flattenTokens(val as TokenGroup, path, result);
    }
  }
  return result;
}

/** Resolve {reference.path} in token values */
function resolveReferences(
  tokens: Map<string, Token>,
  allTokens: Map<string, Token>
): void {
  for (const [, token] of tokens) {
    if (typeof token.$value !== "string") continue;
    token.$value = token.$value.replace(
      /\{([^}]+)\}/g,
      (_, refPath: string) => {
        const ref = allTokens.get(refPath);
        if (!ref) {
          console.warn(`  Warning: unresolved reference {${refPath}}`);
          return `{${refPath}}`;
        }
        return String(ref.$value);
      }
    );
  }
}

// --- Color conversion ---

function oklchToComponents(
  value: string
): { l: number; c: number; h: number } | null {
  const m = value.match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\s*\)/
  );
  if (!m) return null;
  return { l: parseFloat(m[1]), c: parseFloat(m[2]), h: parseFloat(m[3]) };
}

/**
 * OKLch to sRGB hex via the correct OKLab pipeline:
 * OKLch → OKLab(L,a,b) → LMS(l,m,s) via inverse M1 → linear RGB via inverse M2 → sRGB gamma
 * Reference: https://bottosson.github.io/posts/oklab/
 */
function oklchToHex(value: string): string | null {
  const comp = oklchToComponents(value);
  if (!comp) return null;

  const { l: L, c: C, h: H } = comp;
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab to LMS (cube root space) — inverse of M1
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  // Undo cube root to get linear LMS
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS to linear sRGB — inverse of M2
  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // Linear sRGB to gamma-corrected sRGB
  const gammaCorrect = (x: number) => {
    const c = Math.max(0, Math.min(1, x));
    return c <= 0.0031308
      ? c * 12.92
      : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  const toHex = (x: number) =>
    Math.round(Math.max(0, Math.min(255, x * 255)))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(gammaCorrect(lr))}${toHex(gammaCorrect(lg))}${toHex(gammaCorrect(lb))}`;
}

/** Approximate OKLch to HSL string */
function oklchToHsl(value: string): string | null {
  const hex = oklchToHex(value);
  if (!hex) return null;

  const rr = parseInt(hex.slice(1, 3), 16) / 255;
  const gg = parseInt(hex.slice(3, 5), 16) / 255;
  const bb = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  const lum = (max + min) / 2;

  if (d === 0) return `hsl(0, 0%, ${Math.round(lum * 100)}%)`;

  const sat = lum > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue = 0;
  if (max === rr) hue = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
  else if (max === gg) hue = ((bb - rr) / d + 2) / 6;
  else hue = ((rr - gg) / d + 4) / 6;

  return `hsl(${Math.round(hue * 360)}, ${Math.round(sat * 100)}%, ${Math.round(lum * 100)}%)`;
}

/**
 * Canonical hex overrides for brand colors where the OKLch→sRGB conversion
 * produces slightly off values due to gamut mapping. These are the original
 * hex values before the OKLch conversion, documented in each token's $description.
 */
const HEX_OVERRIDES: Record<string, string> = {
  "color.brand.verdigris": "#0fc8c3",
};

// --- Output generators ---

function toCssVarName(tokenPath: string): string {
  return `--${tokenPath.replace(/\./g, "-")}`;
}

function generateOklchCss(
  colorTokens: Map<string, Token>,
  darkTokens: Map<string, Token>
): string {
  let out = "/* Auto-generated — do not edit. Source: tokens/color/ */\n";
  out += "/* OKLch CSS custom properties for modern browsers */\n\n";
  out += ":root {\n";
  for (const [path, token] of colorTokens) {
    const val = String(token.$value);
    if (val.includes("oklch") || val.startsWith("#")) {
      out += `  ${toCssVarName(path)}: ${val};\n`;
    }
  }
  out += "}\n\n";
  out += ".dark {\n";
  for (const [path, token] of darkTokens) {
    const val = String(token.$value);
    out += `  ${toCssVarName(path)}: ${val};\n`;
  }
  out += "}\n";
  return out;
}

function generateHslCss(
  colorTokens: Map<string, Token>,
  darkTokens: Map<string, Token>
): string {
  let out = "/* Auto-generated — do not edit. Source: tokens/color/ */\n";
  out += "/* HSL CSS custom properties for legacy browsers */\n\n";
  out += ":root {\n";
  for (const [path, token] of colorTokens) {
    const val = String(token.$value);
    if (val.includes("oklch")) {
      const hsl = oklchToHsl(val);
      if (hsl) out += `  ${toCssVarName(path)}: ${hsl};\n`;
    }
  }
  out += "}\n\n";
  out += ".dark {\n";
  for (const [path, token] of darkTokens) {
    const val = String(token.$value);
    if (val.includes("oklch")) {
      const hsl = oklchToHsl(val);
      if (hsl) out += `  ${toCssVarName(path)}: ${hsl};\n`;
    } else {
      // Semi-transparent values (e.g., "oklch(1 0 0 / 10%)") — pass through
      out += `  ${toCssVarName(path)}: ${val};\n`;
    }
  }
  out += "}\n";
  return out;
}

function generateHexJson(colorTokens: Map<string, Token>): object {
  const result: Record<string, string> = {};
  for (const [path, token] of colorTokens) {
    if (HEX_OVERRIDES[path]) {
      result[path] = HEX_OVERRIDES[path];
      continue;
    }
    const val = String(token.$value);
    if (val.includes("oklch")) {
      const hex = oklchToHex(val);
      if (hex) result[path] = hex;
    }
  }
  return result;
}

function generateTailwindPreset(
  allTokens: Map<string, Token>,
  semanticLight: Map<string, Token>,
  semanticDark: Map<string, Token>
): string {
  const colors: Record<string, string> = {};
  const spacing: Record<string, string> = {};
  const fontSize: Record<string, string> = {};
  const borderRadius: Record<string, string> = {};

  for (const [path, token] of allTokens) {
    const val = String(token.$value);

    if (path.startsWith("color.brand.")) {
      const name = path.replace("color.brand.", "brand-");
      colors[name] = val;
    } else if (path.startsWith("color.neutral.")) {
      const name = path.replace("color.neutral.", "neutral-");
      colors[name] = val;
    } else if (path.startsWith("color.status.")) {
      const name = path.replace("color.status.", "status-");
      colors[name] = val;
    } else if (path.startsWith("spacing.")) {
      const name = path.replace("spacing.", "");
      spacing[name] = val;
    } else if (path.startsWith("fontSize.")) {
      const name = path.replace("fontSize.", "");
      fontSize[name] = val;
    } else if (path.startsWith("radius.") && !path.includes("legacy")) {
      const name = path.replace("radius.", "");
      borderRadius[name] = val;
    }
  }

  // Add semantic tokens as CSS variable references (shadcn/ui pattern)
  // These resolve via the :root / .dark CSS blocks
  const semanticNames = [
    "background", "foreground", "card", "card-foreground",
    "popover", "popover-foreground", "primary", "primary-foreground",
    "secondary", "secondary-foreground", "muted", "muted-foreground",
    "accent", "accent-foreground", "destructive", "border", "input", "ring",
  ];
  for (const name of semanticNames) {
    colors[name] = `var(--color-semantic-${name})`;
  }

  return `// Auto-generated Tailwind preset — do not edit. Source: tokens/
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 6).replace(/\n/g, "\n      ")},
      spacing: ${JSON.stringify(spacing, null, 6).replace(/\n/g, "\n      ")},
      fontSize: ${JSON.stringify(fontSize, null, 6).replace(/\n/g, "\n      ")},
      borderRadius: ${JSON.stringify(borderRadius, null, 6).replace(/\n/g, "\n      ")},
    },
  },
};
`;
}

// --- Main ---

function main() {
  console.log("Building design tokens...\n");

  // Collect all token files
  const allTokens = new Map<string, Token>();
  const colorTokens = new Map<string, Token>();

  const tokenDirs = ["color", "typography", "spacing", "elevation", "motion"];
  for (const dir of tokenDirs) {
    const dirPath = join(TOKENS, dir);
    try {
      for (const file of readdirSync(dirPath)) {
        if (!file.endsWith(".json")) continue;
        const data = loadJson(join(dirPath, file));
        flattenTokens(data, "", allTokens);
      }
    } catch {
      // Directory may not exist yet
    }
  }

  // Top-level token files
  for (const file of ["radius.json", "breakpoints.json"]) {
    try {
      const data = loadJson(join(TOKENS, file));
      flattenTokens(data, "", allTokens);
    } catch {
      // File may not exist
    }
  }

  // Load dark mode semantic tokens separately
  const darkTokens = new Map<string, Token>();
  const darkData = loadJson(join(TOKENS, "color/semantic-dark.json"));
  flattenTokens(darkData, "", darkTokens);

  // Resolve references (light tokens first, then dark against the full set)
  resolveReferences(allTokens, allTokens);
  resolveReferences(darkTokens, allTokens);

  // Extract color tokens (light mode, includes semantic-light via allTokens)
  for (const [path, token] of allTokens) {
    if (path.startsWith("color.")) {
      colorTokens.set(path, token);
    }
  }

  // Extract dark semantic tokens
  const darkSemanticTokens = new Map<string, Token>();
  for (const [path, token] of darkTokens) {
    if (path.startsWith("color.semantic.")) {
      darkSemanticTokens.set(path, token);
    }
  }

  // Extract light semantic tokens for Tailwind
  const lightSemanticTokens = new Map<string, Token>();
  for (const [path, token] of allTokens) {
    if (path.startsWith("color.semantic.")) {
      lightSemanticTokens.set(path, token);
    }
  }

  // Create dist directories
  for (const sub of ["css", "hex", "tailwind"]) {
    mkdirSync(join(DIST, sub), { recursive: true });
  }

  // Generate outputs
  const oklchCss = generateOklchCss(colorTokens, darkSemanticTokens);
  writeFileSync(join(DIST, "css/oklch.css"), oklchCss);
  console.log(`  css/oklch.css (${colorTokens.size} color tokens + ${darkSemanticTokens.size} dark overrides)`);

  const hslCss = generateHslCss(colorTokens, darkSemanticTokens);
  writeFileSync(join(DIST, "css/hsl.css"), hslCss);
  console.log(`  css/hsl.css`);

  const hexJson = generateHexJson(colorTokens);
  writeFileSync(
    join(DIST, "hex/colors.json"),
    JSON.stringify(hexJson, null, 2)
  );
  console.log(
    `  hex/colors.json (${Object.keys(hexJson).length} hex values)`
  );

  const tailwind = generateTailwindPreset(allTokens, lightSemanticTokens, darkSemanticTokens);
  writeFileSync(join(DIST, "tailwind/preset.js"), tailwind);
  console.log(`  tailwind/preset.js (+ semantic color vars)`);

  // Index file — compatible with Node 18+ (no import attributes)
  const indexJs = `// Auto-generated — do not edit
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
export const hexColors = JSON.parse(readFileSync(join(__dir, 'hex/colors.json'), 'utf-8'));
`;
  writeFileSync(join(DIST, "index.js"), indexJs);

  // TypeScript declarations
  const dts = `// Auto-generated — do not edit
export declare const hexColors: Record<string, string>;
`;
  writeFileSync(join(DIST, "index.d.ts"), dts);

  console.log(`\nDone. ${allTokens.size} total tokens processed.`);
}

main();
