const fs = require('fs');
const path = require('path');

const targets = [
  'node_modules/html2canvas/dist/html2canvas.js',
  'node_modules/html2canvas/dist/html2canvas.esm.js'
];

targets.forEach(relPath => {
  const fullPath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) return;

  let code = fs.readFileSync(fullPath, 'utf8');
  const regex = /if\s*\(\s*typeof\s+colorFunction\s*===\s*['"]undefined['"]\s*\)\s*\{\s*throw\s+new\s+Error\([^)]+\);\s*\}/g;

  if (regex.test(code)) {
    code = code.replace(regex, 'if (typeof colorFunction === "undefined") { return 0x00000000; }');
    fs.writeFileSync(fullPath, code, 'utf8');
    console.log('[patch-html2canvas] Successfully patched modern color handling in', relPath);
  }
});
