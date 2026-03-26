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

/** Approximate OKLch to sRGB hex. Simplified conversion via LCH→Lab→XYZ→sRGB. */
function oklchToHex(value: string): string | null {
  const comp = oklchToComponents(value);
  if (!comp) return null;

  const { l, c, h } = comp;
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLab to linear sRGB (approximate matrix)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const ll = l_ * l_ * l_;
  const mm = m_ * m_ * m_;
  const ss = s_ * s_ * s_;

  const r = +4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss;
  const g = -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss;
  const bVal = -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss;

  const toSrgb = (x: number) => {
    const clamped = Math.max(0, Math.min(1, x));
    return clamped <= 0.0031308
      ? clamped * 12.92
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  const toHexByte = (x: number) =>
    Math.round(Math.max(0, Math.min(255, x * 255)))
      .toString(16)
      .padStart(2, "0");

  return `#${toHexByte(toSrgb(r))}${toHexByte(toSrgb(g))}${toHexByte(toSrgb(bVal))}`;
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

// --- Output generators ---

function toCssVarName(tokenPath: string): string {
  return `--${tokenPath.replace(/\./g, "-")}`;
}

function generateOklchCss(colorTokens: Map<string, Token>): string {
  let out = "/* Auto-generated — do not edit. Source: tokens/color/ */\n";
  out += "/* OKLch CSS custom properties for modern browsers */\n\n";
  out += ":root {\n";
  for (const [path, token] of colorTokens) {
    const val = String(token.$value);
    if (val.includes("oklch") || val.startsWith("#")) {
      out += `  ${toCssVarName(path)}: ${val};\n`;
    }
  }
  out += "}\n";
  return out;
}

function generateHslCss(colorTokens: Map<string, Token>): string {
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
  out += "}\n";
  return out;
}

function generateHexJson(colorTokens: Map<string, Token>): object {
  const result: Record<string, string> = {};
  for (const [path, token] of colorTokens) {
    const val = String(token.$value);
    if (val.includes("oklch")) {
      const hex = oklchToHex(val);
      if (hex) result[path] = hex;
    }
  }
  return result;
}

function generateTailwindPreset(allTokens: Map<string, Token>): string {
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

  // Resolve references
  resolveReferences(allTokens, allTokens);

  // Extract color tokens
  for (const [path, token] of allTokens) {
    if (path.startsWith("color.")) {
      colorTokens.set(path, token);
    }
  }

  // Create dist directories
  for (const sub of ["css", "hex", "tailwind"]) {
    mkdirSync(join(DIST, sub), { recursive: true });
  }

  // Generate outputs
  const oklchCss = generateOklchCss(colorTokens);
  writeFileSync(join(DIST, "css/oklch.css"), oklchCss);
  console.log(`  css/oklch.css (${colorTokens.size} color tokens)`);

  const hslCss = generateHslCss(colorTokens);
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

  const tailwind = generateTailwindPreset(allTokens);
  writeFileSync(join(DIST, "tailwind/preset.js"), tailwind);
  console.log(`  tailwind/preset.js`);

  // Index file
  const indexJs = `// Auto-generated — do not edit
export { default as hexColors } from './hex/colors.json' with { type: 'json' };
`;
  writeFileSync(join(DIST, "index.js"), indexJs);

  console.log(`\nDone. ${allTokens.size} total tokens processed.`);
}

main();
