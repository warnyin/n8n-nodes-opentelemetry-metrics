const fs = require('fs');
const path = require('path');

function copySvgs(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(srcDir, e.name);
    const destPath = path.join(destDir, e.name);
    if (e.isDirectory()) {
      copySvgs(srcPath, destPath);
    } else if (e.isFile() && e.name.endsWith('.svg')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copySvgs(path.join(__dirname, '..', 'nodes'), path.join(__dirname, '..', 'dist', 'nodes'));
