---
name: shell-pipe-exit-code
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(sh|bash)$|\.husky/|pre-commit|pre-push
  - field: new_text
    operator: regex_match
    pattern: if\s+.*\|\s*(tail|head|grep)\b
action: block
---

**Shell pipeline exit code bug detected**

You are writing `if command | tail` or `if command | head` in a shell script. This is a bug: in a pipeline `cmd1 | cmd2`, the exit code is from `cmd2` (which almost always succeeds), masking failures from `cmd1`.

**Fix**: Capture output first, then check `$?`:

```sh
output=$(command 2>&1)
status=$?
echo "$output" | tail -10
if [ $status -eq 0 ]; then
    echo "Passed"
else
    echo "Failed"
    exit 1
fi
```

This was caught by gemini-code-assist review on PR #94. See: https://github.com/VerdigrisTech/verdigris/pull/94#discussion_r2800569495
