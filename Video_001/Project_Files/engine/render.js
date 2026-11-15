// Past The Rating render engine. Renders timeline segments (engine.html scenes) to video.
// node render.js preview <timeline.json> <outdir> [scale]      → contact sheet PNG per segment
// node render.js full <timeline.json> <outdir> [W] [workers]   → one MP4 per segment (cached, resumable)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { spawn } = require('child_process');

const [, , mode, tlPath, outDir, a3, a4] = process.argv;
const TL = JSON.parse(fs.readFileSync(tlPath));
const FPS = TL.fps;
const VERT = process.env.V === '1';
const ENGINE = path.join(__dirname, VERT ? 'engine_v.html' : 'engine.html');
const engineHash = crypto.createHash('sha1').update(fs.readFileSync(ENGINE)).digest('hex').slice(0, 10);
fs.mkdirSync(outDir, { recursive: true });
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const segs = TL.segments.filter(s => !only || only.includes(s.id));

async function newPage(browser, scale) {
  const page = await browser.newPage({ viewport: VERT ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 }, deviceScaleFactor: scale });
  await page.goto('file://' + ENGINE);
  await page.evaluate(() => document.fonts.ready);
  return page;
}
async function frame(page, seg, t) {
  await page.evaluate(([s, tt, v]) => { window.setSegment(s); v ? window.renderFrameV(tt) : window.renderFrame(tt); }, [seg, t, VERT]);
  return page.screenshot({ type: 'jpeg', quality: 93 });
}

async function preview() {
  const scale = Number(a3 || 0.5);
  const browser = await chromium.launch();
  const page = await newPage(browser, scale);
  for (const seg of segs) {
    const n = 6, files = [];
    for (let i = 0; i < n; i++) {
      const t = Math.min(seg.dur - 0.05, (i + 0.5) * seg.dur / n);
      const f = path.join(outDir, `${seg.id}_${i}.jpg`);
      fs.writeFileSync(f, await frame(page, seg, t)); files.push(f);
    }
    await new Promise(r => spawn('convert', [...files, '+append', '-resize', '50%', path.join(outDir, `${seg.id}.jpg`)]).on('close', r));
    files.forEach(f => fs.unlinkSync(f));
    console.log('preview', seg.id);
  }
  await browser.close();
}

async function full() {
  const W = Number(a3 || 3840), workers = Number(a4 || 3), scale = W / (VERT ? 1080 : 1920);
  const browser = await chromium.launch();
  const queue = segs.slice().sort((x, y) => y.dur - x.dur);
  const worker = async (wi) => {
    const page = await newPage(browser, scale);
    while (queue.length) {
      const seg = queue.shift();
      const key = crypto.createHash('sha1').update(JSON.stringify(seg) + engineHash + W).digest('hex').slice(0, 12);
      const out = path.join(outDir, `${seg.id}.mp4`), stamp = out + '.key';
      if (fs.existsSync(out) && fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8') === key) { console.log(seg.id, 'cached'); continue; }
      const nFrames = Math.round(seg.dur * FPS), t0 = Date.now();
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-r', String(FPS),
        '-g', String(FPS * 2), '-bf', '2', '-x264-params', 'threads=2', out + '.tmp.mp4']);
      for (let i = 0; i < nFrames; i++) {
        const buf = await frame(page, seg, i / FPS);
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      }
      ff.stdin.end();
      const code = await new Promise(r => ff.on('close', r));
      if (code !== 0) throw new Error('ffmpeg failed for ' + seg.id);
      fs.renameSync(out + '.tmp.mp4', out); fs.writeFileSync(stamp, key);
      console.log(`[w${wi}] ${seg.id} ${nFrames}f in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    await page.close();
  };
  await Promise.all(Array.from({ length: workers }, (_, i) => worker(i)));
  await browser.close();
}

(mode === 'preview' ? preview() : full()).catch(e => { console.error(e); process.exit(1); });
