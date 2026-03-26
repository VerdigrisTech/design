/**
 * Token validation script.
 *
 * Checks all token JSON files for:
 *   - Valid JSON syntax
 *   - Broken references ({path.that.doesnt.exist})
 *   - Missing $type on tokens
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS = join(__dirname, "..", "tokens");

interface Token {
  $value: string | number;
  $type?: string;
  $description?: string;
}

type TokenGroup = { [key: string]: Token | TokenGroup | string };

function isToken(obj: unknown): obj is Token {
  return typeof obj === "object" && obj !== null && "$value" in obj;
}

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

function collectFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        files.push(...collectFiles(join(dir, entry.name)));
      } else if (entry.name.endsWith(".json")) {
        files.push(join(dir, entry.name));
      }
    }
  } catch {
    // skip
  }
  return files;
}

function main() {
  console.log("Validating design tokens...\n");
  let errors = 0;
  let warnings = 0;

  const allTokens = new Map<string, Token>();
  const files = collectFiles(TOKENS);

  // Pass 1: load and parse all files
  for (const file of files) {
    const rel = file.replace(TOKENS + "/", "");
    try {
      const data = JSON.parse(readFileSync(file, "utf-8"));
      flattenTokens(data, "", allTokens);
      console.log(`  OK ${rel}`);
    } catch (e) {
      console.error(`  FAIL ${rel}: ${e instanceof Error ? e.message : e}`);
      errors++;
    }
  }

  // Pass 2: check references and types
  for (const [path, token] of allTokens) {
    if (typeof token.$value === "string") {
      const refs = token.$value.matchAll(/\{([^}]+)\}/g);
      for (const [, refPath] of refs) {
        if (!allTokens.has(refPath)) {
          console.error(`  BROKEN REF: ${path} references {${refPath}}`);
          errors++;
        }
      }
    }

    if (!token.$type) {
      console.warn(`  WARN: ${path} missing $type`);
      warnings++;
    }
  }

  console.log(
    `\n${allTokens.size} tokens, ${errors} errors, ${warnings} warnings`
  );
  process.exit(errors > 0 ? 1 : 0);
}

main();
