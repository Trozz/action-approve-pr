// Syntax-checks the github-script embedded in action.yml without needing a YAML
// parser or any dependencies. Extracts the block under `script: |` and parses it
// as the body of an async function (github-script wraps it the same way), so
// top-level await is allowed. Exits non-zero on a syntax error.
const fs = require('fs');

const path = process.argv[2] || 'action.yml';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const start = lines.findIndex(l => l.trim() === 'script: |');
if (start < 0) {
  console.error(`No 'script: |' block found in ${path}`);
  process.exit(2);
}

const base = lines[start].indexOf('script:');
const body = [];
for (let i = start + 1; i < lines.length; i++) {
  const l = lines[i];
  if (l.trim() === '') { body.push(''); continue; }
  const indent = l.length - l.trimStart().length;
  if (indent <= base) break;
  body.push(l.slice(base + 2));
}

try {
  // eslint-disable-next-line no-new-func
  new Function('github', 'context', 'core', `return (async () => {\n${body.join('\n')}\n})()`);
  console.log(`Embedded script OK (${body.length} lines).`);
} catch (err) {
  console.error(`Embedded script syntax error: ${err.message}`);
  process.exit(1);
}
