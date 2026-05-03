#!/usr/bin/env bash
# Validator-suite tests for build/validate-rules.ts.
#
# For each fixture under tests/fixtures/validate-rules/, runs the validator with
# VD_ROOT pointed at the fixture and confirms it exits NONZERO (the fixture is
# correctly detected). Then runs the validator against the real repo root and
# confirms it exits ZERO (no false positives on real artifacts).
#
# Run directly or via `npm run test:validators`.

set -u
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
PASS=0
FAIL=0

run_fixture() {
  local name="$1"
  local fixture="$ROOT/tests/fixtures/validate-rules/$name"
  if [ ! -d "$fixture" ]; then
    echo "FAIL: fixture $name not found at $fixture"
    FAIL=$((FAIL + 1))
    return
  fi
  echo "--- $name (expected: NONZERO exit) ---"
  if VD_ROOT="$fixture" npx tsx build/validate-rules.ts > /tmp/vd-validator-$name.log 2>&1; then
    echo "FAIL: validator exited 0 for fixture $name (expected nonzero)."
    cat "/tmp/vd-validator-$name.log"
    FAIL=$((FAIL + 1))
  else
    echo "OK: validator detected fixture $name."
    PASS=$((PASS + 1))
  fi
}

run_fixture "broken-token-css-sync"
run_fixture "missing-voice-profile"
run_fixture "pii-leak"

echo ""
echo "--- real repo root (expected: ZERO exit, no false positives) ---"
if npx tsx build/validate-rules.ts > /tmp/vd-validator-real.log 2>&1; then
  echo "OK: validator passed on real repo root."
  PASS=$((PASS + 1))
else
  echo "FAIL: validator exited nonzero on real repo root (false positive)."
  cat /tmp/vd-validator-real.log
  FAIL=$((FAIL + 1))
fi

echo ""
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
