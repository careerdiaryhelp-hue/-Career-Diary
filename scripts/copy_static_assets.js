import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDir = path.join(__dirname, '../.next/server/app');
const assetsDir = path.join(__dirname, '../.open-next/assets');

let copiedCount = 0;

function copyStaticFiles(src, dest) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.endsWith('.segments')) continue;
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyStaticFiles(srcPath, destPath);
    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.rsc')) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.copyFileSync(srcPath, destPath);
      copiedCount++;

      // Also create <page>/index.html so Cloudflare Assets handles both trailing slash and non-trailing slash
      if (entry.name.endsWith('.html') && entry.name !== 'index.html') {
        const baseName = entry.name.replace(/\.html$/, '');
        const folderPath = path.join(dest, baseName);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        fs.copyFileSync(srcPath, path.join(folderPath, 'index.html'));
      }
    }
  }
}

copyStaticFiles(appDir, assetsDir);
console.log(`Successfully copied ${copiedCount} pre-rendered HTML and RSC files to .open-next/assets for 0ms Cloudflare asset serving.`);
