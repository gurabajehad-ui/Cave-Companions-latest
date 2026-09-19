import fs from 'fs';
import path from 'path';

try {
  const srcFonts = path.join(process.cwd(), 'server/assets/fonts');
  const distFonts = path.join(process.cwd(), 'dist/fonts');

  if (fs.existsSync(srcFonts)) {
    fs.mkdirSync(distFonts, { recursive: true });
    const files = fs.readdirSync(srcFonts);
    for (const f of files) {
      fs.copyFileSync(path.join(srcFonts, f), path.join(distFonts, f));
    }
    console.log(`Copied ${files.length} font file(s) to dist/fonts`);
  }
} catch (err) {
  console.warn('Font copying skipped:', err);
}
