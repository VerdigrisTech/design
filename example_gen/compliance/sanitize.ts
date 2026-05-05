// Prompt-injection guards. Rule prompts come from rules/visual-rules.yml, which
// is reviewed code; voice context comes from voice/team/*.yaml, which is also
// reviewed but contains free prose that could shadow rubric markers. We run
// both through validators so a sloppy or malicious edit cannot disable the
// rubric the system prompt establishes.

const CONTROL_CHARS_NO_TAB = /[\x00-\x08\x0b-\x1f\x7f]/;
const CONTROL_CHARS_NO_TAB_NO_NEWLINE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;

const FORBIDDEN_INJECTION_PATTERNS: RegExp[] = [
  /\b(ignore (?:all |the )?previous|disregard (?:all |the )?previous|system prompt|new instructions?|override (?:these )?(?:rules|instructions))\b/i,
  // Lines that mimic our numbered-answer rubric would forge answers if the
  // model echoed them back through.
  /^[ \t]*\d+\.[ \t]+(YES|NO)\b/m,
  // "Convention: YES = ..." re-defines the rubric.
  /Convention:[ \t]*(YES|NO)\b/i,
];

export function validateRulePrompt(ruleId: string, prompt: unknown): string {
  if (typeof prompt !== "string") {
    throw new Error(`rule "${ruleId}": llm_eval prompt must be a string`);
  }
  if (prompt.length === 0) {
    throw new Error(`rule "${ruleId}": llm_eval prompt is empty`);
  }
  if (prompt.length > 1000) {
    throw new Error(`rule "${ruleId}": llm_eval prompt exceeds 1000 chars (got ${prompt.length})`);
  }
  if (CONTROL_CHARS_NO_TAB.test(prompt)) {
    throw new Error(`rule "${ruleId}": llm_eval prompt contains control characters`);
  }
  if (/\r|\n/.test(prompt)) {
    throw new Error(`rule "${ruleId}": llm_eval prompt must be a single line (no newlines)`);
  }
  for (const pat of FORBIDDEN_INJECTION_PATTERNS) {
    if (pat.test(prompt)) {
      throw new Error(
        `rule "${ruleId}": llm_eval prompt matches forbidden pattern ${pat}. ` +
        `Rubric markers (YES/NO/numbered answers) and instruction-override phrases ` +
        `are reserved for the auditor's system prompt and cannot appear in rule prompts.`,
      );
    }
  }
  return prompt;
}

export function sanitizeUntrustedText(text: string, maxChars: number): string {
  // Strip control chars except tab and newline (voice context is multi-line)
  // and cap length. Used for content that the auditor injects into a
  // user-message wrapped in delimited fences.
  return text
    .replace(CONTROL_CHARS_NO_TAB_NO_NEWLINE, "")
    .slice(0, maxChars);
}
