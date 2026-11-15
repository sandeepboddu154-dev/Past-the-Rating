// Renders all brand assets to brand/renders/. Usage: node brand/src/render.js [--no-video]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const T = require('./templates');

const OUT = path.join(__dirname, '..', 'renders');
fs.mkdirSync(OUT, { recursive: true });

async function shot(browser, html, w, h, file) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, type: file.endsWith('.jpg') ? 'jpeg' : 'png', quality: file.endsWith('.jpg') ? 92 : undefined });
  await page.close();
  console.log('wrote', path.relative(process.cwd(), file));
}

(async () => {
  const browser = await chromium.launch();
  await shot(browser, T.banner(), 2560, 1440, path.join(OUT, 'channel-banner-2560x1440.png'));
  await shot(browser, T.thumbLF01(), 1280, 720, path.join(OUT, 'thumb-LF-01.png'));
  for (const [name, fn] of Object.entries(T.covers)) await shot(browser, fn(), 1080, 1920, path.join(OUT, `${name}.png`));

  if (!process.argv.includes('--no-video')) {
    const frames = path.join(OUT, '_frames');
    fs.rmSync(frames, { recursive: true, force: true });
    fs.mkdirSync(frames);
    const fps = 30, secs = 3.5, n = Math.round(fps * secs);
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    for (let i = 0; i < n; i++) {
      await page.setContent(T.ratingBarFrame(i / (n - 1)), { waitUntil: 'load' });
      await page.screenshot({ path: path.join(frames, `f${String(i).padStart(4, '0')}.png`) });
    }
    await page.close();
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(frames, 'f%04d.png'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', path.join(OUT, 'rating-bar-demo.mp4')]);
    fs.rmSync(frames, { recursive: true, force: true });
    console.log('wrote brand/renders/rating-bar-demo.mp4');
  }
  await browser.close();
})();
