// Thumbnail renderer: reuses engine.html drawing functions for exact visual continuity with the film.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'engine/engine.html')); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => {
    const body = `
      <rect width="1920" height="1080" fill="${C.carbon}"/><rect width="1920" height="1080" fill="url(#grid)"/>
      <g transform="translate(-260 -40) scale(1.25)">
        ${boxBeam(860, 560, {})}
        ${rod(838, -100, 650, {w: 20})}
        ${rod(882, 470, 1200, {w: 20, col: C.orange})}
        <rect x="852" y="${560-75-30}" width="60" height="30" fill="${C.orange}"/>
        <ellipse cx="838" cy="680" rx="120" ry="60" fill="${C.orange}" opacity=".35" filter="url(#blur)"/>
        ${nut(838, 635, {glow: 1})}
        ${arrowDown(660, 300, 130, C.steel, .9, 10)}
        ${arrowDown(960, 720, 120, C.orange, 1, 10)}
      </g>
      <text x="1830" y="560" font-size="460" class="mono" fill="${C.orange}" text-anchor="end" letter-spacing="-30">2×</text>
      <text x="1830" y="720" font-size="104" font-weight="900" fill="${C.white}" text-anchor="end">ONE NUT.</text>
      <text x="1830" y="800" font-size="46" font-weight="800" fill="${C.steel}" text-anchor="end" letter-spacing="6">KANSAS CITY · 1981</text>
      <rect width="1920" height="1080" fill="url(#vig)"/>`;
    window.setSegment({ visual: 'chapter', dur: 1, params: { num: '', title: '' } });
    window.renderFrame(0.5);
    const st = document.getElementById('stage'); const defs = st.querySelector('defs').outerHTML;
    st.innerHTML = defs + body;
  });
  await p.screenshot({ path: process.argv[2] });
  await b.close();
})();
