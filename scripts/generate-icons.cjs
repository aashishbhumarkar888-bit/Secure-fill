const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const root = path.resolve(__dirname, '..');
  const svg = path.join(root, 'extension', 'icons', 'icon.svg');
  const outDir = path.join(root, 'extension', 'icons');

  if (!fs.existsSync(svg)) {
    console.error('icon.svg not found at', svg);
    process.exit(1);
  }

  const sizes = [16, 48, 128];
  await Promise.all(
    sizes.map(async (s) => {
      const out = path.join(outDir, `icon-${s}.png`);
      await sharp(svg).resize(s, s, { fit: 'contain' }).png().toFile(out);
      console.log('Wrote', out);
    })
  );
}

generate().catch((e) => {
  console.error(e);
  process.exit(1);
});
