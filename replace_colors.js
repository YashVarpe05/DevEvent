const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /#C9A84C/gi, replacement: '#FF6B35' },
  { regex: /#DFC06E/gi, replacement: '#FF8555' },
  { regex: /#8A6E2A/gi, replacement: '#CC4A1A' },
  { regex: /#131008/g, replacement: '#1A0A05' },
  { regex: /rgba\(\s*201\s*,\s*168\s*,\s*76/g, replacement: 'rgba(255,107,53' },
  { regex: /rgba\(\s*212\s*,\s*175\s*,\s*55/g, replacement: 'rgba(255,107,53' }
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (['node_modules', '.next', '__tests__', '.git', '.gsd', '.gemini'].includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.match(/\.(ts|tsx|css)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const {regex, replacement} of replacements) {
        if (content.match(regex)) {
          content = content.replace(regex, replacement);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir('.');
