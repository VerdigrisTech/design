// Auto-generated — do not edit
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
export const hexColors = JSON.parse(readFileSync(join(__dir, 'hex/colors.json'), 'utf-8'));
