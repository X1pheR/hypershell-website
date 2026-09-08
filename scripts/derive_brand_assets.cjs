const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const brandRoot = process.env.BRAND_ROOT;
const repoRoot = process.env.REPO_ROOT || '/work';
if (!brandRoot) throw new Error('BRAND_ROOT is required');
const masterRel = 'assets/masterbrand/hypershell-masterbrand.png';
const spinyRel = 'assets/mascot/spiny.png';
const master = path.join(brandRoot, masterRel);
const spiny = path.join(brandRoot, spinyRel);
const publicDir = path.join(repoRoot, 'public');
const dataDir = path.join(repoRoot, 'src', 'data');
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function pngIco(png) {
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16); entry[0] = 96; entry[1] = 96; entry[2] = 0; entry[3] = 0; entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6); entry.writeUInt32LE(png.length, 8); entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  async function encode(input, width, height, mime, quality) {
    const data = fs.readFileSync(input).toString('base64');
    const result = await page.evaluate(async ({data, width, height, mime, quality}) => {
      const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: true }); ctx.clearRect(0, 0, width, height); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(image, 0, 0, width, height);
      return canvas.toDataURL(mime, quality).split(',')[1];
    }, {data, width, height, mime, quality});
    return Buffer.from(result, 'base64');
  }
  const master96 = await encode(master, 96, 96, 'image/png');
  fs.writeFileSync(path.join(publicDir, 'masterbrand-96.png'), master96);
  fs.writeFileSync(path.join(publicDir, 'favicon-96x96.png'), master96);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pngIco(master96));
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), await encode(master, 180, 180, 'image/png'));
  fs.writeFileSync(path.join(publicDir, 'web-app-manifest-192x192.png'), await encode(master, 192, 192, 'image/png'));
  fs.writeFileSync(path.join(publicDir, 'web-app-manifest-512x512.png'), await encode(master, 512, 512, 'image/png'));
  fs.writeFileSync(path.join(publicDir, 'spiny.png'), await encode(spiny, 512, 512, 'image/png'));
  fs.writeFileSync(path.join(publicDir, 'spiny.webp'), await encode(spiny, 512, 512, 'image/webp', 0.88));
  const social = path.join(publicDir, 'social-card.png');
  if (fs.existsSync(social)) fs.writeFileSync(path.join(publicDir, 'social-card.jpg'), await encode(social, 1200, 630, 'image/jpeg', 0.90));
  await browser.close();
  const provenance = {
    masterbrand: { source: masterRel, sha256: sha(master) },
    spiny: { source: spinyRel, sha256: sha(spiny) },
    derivatives: ['masterbrand-96.png','favicon-96x96.png','favicon.ico','apple-touch-icon.png','web-app-manifest-192x192.png','web-app-manifest-512x512.png','spiny.png','spiny.webp','social-card.jpg']
  };
  fs.writeFileSync(path.join(dataDir, 'brand-assets.json'), JSON.stringify(provenance, null, 2) + '\n');
})().catch((error) => { console.error(error); process.exit(1); });
