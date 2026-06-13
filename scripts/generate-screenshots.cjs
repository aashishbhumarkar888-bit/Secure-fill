const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function makePopupScreenshot(outPath) {
  const svg = `
  <svg width="1280" height="800" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f9fafb"/>
    <rect x="200" y="120" width="880" height="560" rx="12" fill="#fff" stroke="#e5e7eb"/>
    <text x="240" y="170" font-size="28" fill="#111827">SecureFill AI — Popup</text>
    <rect x="240" y="200" width="360" height="42" rx="6" fill="#f3f4f6"/>
    <rect x="240" y="256" width="360" height="42" rx="6" fill="#f3f4f6"/>
    <rect x="240" y="312" width="360" height="42" rx="6" fill="#f3f4f6"/>
    <rect x="240" y="380" width="200" height="48" rx="8" fill="#667eea"/>
    <text x="260" y="410" font-size="16" fill="#fff">Save Profile</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

async function makeFloatingScreenshot(outPath) {
  const svg = `
  <svg width="1280" height="800" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <text x="40" y="80" font-size="32" fill="#111827">Example form page</text>
    <rect x="40" y="120" width="520" height="48" rx="6" fill="#fff" stroke="#e5e7eb"/>
    <rect x="40" y="188" width="520" height="48" rx="6" fill="#fff" stroke="#e5e7eb"/>
    <rect x="40" y="256" width="520" height="48" rx="6" fill="#fff" stroke="#e5e7eb"/>
    <circle cx="1220" cy="680" r="28" fill="#667eea" />
    <text x="1210" y="686" font-size="24" fill="#fff">✦</text>
    <text x="40" y="360" font-size="16" fill="#6b7280">Floating autofill button shown bottom-right</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

async function main() {
  const outDir = path.resolve(__dirname, '..', 'extension', 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await makePopupScreenshot(path.join(outDir, 'screenshot-popup.png'));
  await makeFloatingScreenshot(path.join(outDir, 'screenshot-floating.png'));
  console.log('Generated screenshots in', outDir);
}

main().catch((e) => { console.error(e); process.exit(1); });
