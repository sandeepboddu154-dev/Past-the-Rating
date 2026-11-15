// Past The Rating — brand asset templates (HTML/SVG), rendered by render.js with Playwright.
// Palette and type follow docs/04-brand-identity.md.

const C = {
  carbon: '#0B0B0C', graphite: '#1C1F24', steel: '#C9CDD2', white: '#F4F4F2', orange: '#FF5A1F',
};

const base = (w, h, body, extraCss = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:'InterD';src:local('Inter Display Black'),local('InterDisplay-Black');font-weight:900}
  @font-face{font-family:'InterD';src:local('Inter Display ExtraBold'),local('InterDisplay-ExtraBold');font-weight:800}
  @font-face{font-family:'InterD';src:local('Inter Display SemiBold'),local('InterDisplay-SemiBold');font-weight:600}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;background:${C.carbon};overflow:hidden}
  body{font-family:'InterD','Inter',sans-serif;color:${C.white};position:relative}
  .grid{position:absolute;inset:0;
    background-image:linear-gradient(${C.graphite} 1px,transparent 1px),linear-gradient(90deg,${C.graphite} 1px,transparent 1px);
    background-size:${Math.round(w / 32)}px ${Math.round(w / 32)}px;opacity:.55}
  .vignette{position:absolute;inset:0;background:radial-gradient(ellipse at 40% 45%,transparent 30%,${C.carbon} 95%)}
  .mono{font-family:'DejaVu Sans Mono',monospace;font-weight:700;letter-spacing:-0.04em}
  .caps{text-transform:uppercase;letter-spacing:-0.02em}
  ${extraCss}
</style></head><body><div class="grid"></div><div class="vignette"></div>${body}</body></html>`;

// The logo mark: open square broken by an orange slash (vector re-draw of the avatar).
const logo = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
  <path d="M22 22 H74 L66 30 H30 V66 L22 74 Z" fill="${C.steel}"/>
  <path d="M78 26 V78 H26 L34 70 H70 V34 Z" fill="${C.steel}"/>
  <path d="M86 14 L20 82 L16 80 Z" fill="${C.orange}"/>
</svg>`;

// Rating Bar. value and max are percentages; rated is where the RATED tick sits.
function ratingBar({ width, height, value, rated = 100, max = 160, label = 'RATED', unit = '%', showNumber = true, numberSize = 0, tickLabel = null, hideTick = false }) {
  const px = (v) => (Math.min(v, max) / max) * width;
  const steelW = px(Math.min(value, rated));
  const orangeW = value > rated ? px(value) - px(rated) : 0;
  const tickX = px(rated);
  const ns = numberSize || height * 2.2;
  return `<div style="position:relative;width:${width}px">
    ${showNumber ? `<div class="mono" style="font-size:${ns}px;line-height:1;color:${value > rated ? C.orange : C.white};margin-bottom:${height * 0.5}px">${value % 1 ? value.toFixed(1) : value}${unit}</div>` : ''}
    <div style="position:relative;width:${width}px;height:${height}px;background:${C.graphite};outline:2px solid #2a2e35">
      <div style="position:absolute;left:0;top:0;height:100%;width:${steelW}px;background:${C.steel}"></div>
      <div style="position:absolute;left:${tickX}px;top:0;height:100%;width:${orangeW}px;background:${C.orange};
        clip-path:polygon(0 0,100% 0,calc(100% - ${height * 0.5}px) 100%,0 100%)"></div>
      ${hideTick ? '' : `<div style="position:absolute;left:${tickX - 2}px;top:-${height * 0.45}px;width:4px;height:${height * 1.9}px;background:${C.white}"></div>`}
    </div>
    <div class="caps" style="position:absolute;left:${tickX}px;transform:translateX(-50%);margin-top:${height * 0.55}px;
      font-weight:800;font-size:${Math.max(14, height * 0.55)}px;color:${C.steel};white-space:nowrap">${tickLabel ?? `${label} ${rated}${unit}`}</div>
  </div>`;
}

// 1) Channel banner 2560x1440. Safe area for all devices is the centred 1546x423.
const banner = () => base(2560, 1440, `
  <div style="position:absolute;left:507px;top:508px;width:1546px;height:423px;display:flex;align-items:center;gap:56px">
    ${logo(260)}
    <div>
      <div class="caps" style="font-weight:900;font-size:118px;line-height:.92">Past The Rating</div>
      <div style="font-weight:600;font-size:40px;color:${C.steel};margin-top:22px">Everything is built for a number. <span style="color:${C.orange}">We show what happens past it.</span></div>
      <div class="caps" style="font-weight:800;font-size:26px;color:${C.steel};margin-top:26px;letter-spacing:.12em;opacity:.8">Investigations · Tested to Destruction · Read the Rating</div>
    </div>
  </div>
  <div style="position:absolute;left:0;right:0;top:1060px;display:flex;justify-content:center;opacity:.9">
    ${ratingBar({ width: 1300, height: 22, value: 154, rated: 100, showNumber: false, label: 'RATED' })}
  </div>`);

// 2) LF-01 thumbnail 1280x720: two stacked walkways, lower rod orange, "2×".
const thumbLF01 = () => base(1280, 720, `
  <svg style="position:absolute;left:40px;top:40px" width="760" height="640" viewBox="0 0 760 640">
    <defs><pattern id="h" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="10" stroke="${C.steel}" stroke-width="2" opacity=".35"/></pattern></defs>
    <!-- ceiling -->
    <rect x="40" y="30" width="680" height="26" fill="${C.steel}"/>
    <!-- upper rods (ceiling to 4th floor) -->
    <rect x="200" y="56" width="12" height="214" fill="${C.steel}"/>
    <rect x="548" y="56" width="12" height="214" fill="${C.steel}"/>
    <!-- 4th floor walkway -->
    <rect x="110" y="270" width="540" height="58" fill="url(#h)" stroke="${C.steel}" stroke-width="5"/>
    <text x="664" y="312" fill="${C.steel}" font-family="InterD" font-weight="800" font-size="30">4F</text>
    <!-- lower rods (4th floor to 2nd floor) in ORANGE -->
    <rect x="220" y="328" width="12" height="190" fill="${C.orange}"/>
    <rect x="528" y="328" width="12" height="190" fill="${C.orange}"/>
    <!-- 2nd floor walkway -->
    <rect x="110" y="518" width="540" height="58" fill="url(#h)" stroke="${C.steel}" stroke-width="5"/>
    <text x="664" y="560" fill="${C.steel}" font-family="InterD" font-weight="800" font-size="30">2F</text>
    <!-- failure point: orange slash through the upper-left connection -->
    <path d="M150 360 L300 220 L306 226 L158 368 Z" fill="${C.orange}"/>
    <circle cx="214" cy="330" r="34" fill="none" stroke="${C.orange}" stroke-width="5"/>
  </svg>
  <div style="position:absolute;right:70px;top:110px;text-align:right">
    <div class="mono" style="font-size:300px;line-height:.9;color:${C.orange}">2×</div>
    <div class="caps" style="font-weight:900;font-size:74px;line-height:1;margin-top:8px">One change</div>
    <div class="mono" style="font-size:40px;color:${C.steel};margin-top:22px">1981</div>
  </div>
  <div style="position:absolute;left:46px;bottom:34px;opacity:.9">${logo(64)}</div>`);

// 3) Short covers 1080x1920. Keep text in the upper ~70% (Shorts UI covers the bottom).
const shortCover = ({ kicker, big, sub, art, value, rated, max, unit, label, tickLabel = null, hideTick = false }) => base(1080, 1920, `
  <div style="position:absolute;left:90px;right:90px;top:170px">
    <div class="caps" style="font-weight:800;font-size:46px;color:${C.steel};letter-spacing:.06em">${kicker}</div>
  </div>
  <div style="position:absolute;left:0;right:0;top:330px;display:flex;justify-content:center">${art}</div>
  <div style="position:absolute;left:90px;right:90px;top:960px">
    ${ratingBar({ width: 900, height: 40, value, rated, max, unit, label, numberSize: 230, tickLabel, hideTick })}
    <div class="caps" style="font-weight:900;font-size:84px;line-height:1;margin-top:120px">${big}</div>
    <div style="font-weight:600;font-size:40px;color:${C.steel};margin-top:20px">${sub}</div>
  </div>
  <div style="position:absolute;right:70px;top:150px">${logo(96)}</div>`);

const wingArt = `<svg width="900" height="560" viewBox="0 0 900 560">
  <rect x="380" y="380" width="140" height="60" rx="30" fill="${C.steel}"/>
  <path d="M450 400 C 300 395, 160 330, 40 120" stroke="${C.steel}" stroke-width="26" fill="none" stroke-linecap="round"/>
  <path d="M450 400 C 600 395, 740 330, 860 120" stroke="${C.steel}" stroke-width="26" fill="none" stroke-linecap="round"/>
  <path d="M450 410 C 300 410, 160 400, 40 400" stroke="${C.steel}" stroke-width="3" stroke-dasharray="12 10" fill="none" opacity=".6"/>
  <path d="M450 410 C 600 410, 740 400, 860 400" stroke="${C.steel}" stroke-width="3" stroke-dasharray="12 10" fill="none" opacity=".6"/>
  <line x1="880" y1="120" x2="880" y2="400" stroke="${C.orange}" stroke-width="4"/>
  <text x="700" y="480" fill="${C.orange}" font-family="DejaVu Sans Mono" font-weight="700" font-size="40">≈24 FT</text>
  <path d="M330 460 L250 330 L258 326 L338 456 Z" fill="${C.orange}"/>
  <path d="M570 460 L650 330 L642 326 L562 456 Z" fill="${C.orange}"/>
</svg>`;

const shaftArt = `<svg width="600" height="620" viewBox="0 0 600 620">
  <rect x="170" y="0" width="260" height="620" fill="none" stroke="${C.steel}" stroke-width="8"/>
  ${Array.from({ length: 12 }, (_, i) => `<line x1="150" y1="${20 + i * 50}" x2="170" y2="${20 + i * 50}" stroke="${C.steel}" stroke-width="4"/>`).join('')}
  <line x1="260" y1="0" x2="260" y2="150" stroke="${C.orange}" stroke-width="6" stroke-dasharray="20 14"/>
  <line x1="340" y1="0" x2="340" y2="150" stroke="${C.orange}" stroke-width="6" stroke-dasharray="20 14"/>
  <rect x="200" y="300" width="200" height="190" fill="${C.graphite}" stroke="${C.steel}" stroke-width="8"/>
  <line x1="300" y1="300" x2="300" y2="490" stroke="${C.steel}" stroke-width="4"/>
  ${[0, 1, 2].map((i) => `<path d="M${220 + i * 80} 240 v-60" stroke="${C.steel}" stroke-width="5" opacity="${0.8 - i * 0.2}"/>`).join('')}
  <path d="M190 560 q 55 -30 110 0 q 55 30 110 0" stroke="${C.orange}" stroke-width="7" fill="none"/>
  <path d="M190 590 q 55 -30 110 0 q 55 30 110 0" stroke="${C.orange}" stroke-width="7" fill="none"/>
</svg>`;

const sledArt = `<svg width="900" height="560" viewBox="0 0 900 560">
  <line x1="0" y1="420" x2="900" y2="420" stroke="${C.steel}" stroke-width="6"/>
  <line x1="0" y1="440" x2="900" y2="440" stroke="${C.steel}" stroke-width="3" opacity=".5"/>
  <path d="M300 410 L560 410 L620 360 L520 330 L360 330 Z" fill="${C.graphite}" stroke="${C.steel}" stroke-width="7"/>
  <rect x="430" y="270" width="60" height="70" rx="12" fill="none" stroke="${C.steel}" stroke-width="7"/>
  <path d="M300 360 L60 330 L60 400 L300 395 Z" fill="${C.orange}" opacity=".9"/>
  ${[0, 1, 2, 3].map((i) => `<line x1="${640 + i * 50}" y1="${300 + i * 25}" x2="${860}" y2="${300 + i * 25}" stroke="${C.steel}" stroke-width="4" opacity="${0.7 - i * 0.15}"/>`).join('')}
  <text x="600" y="520" fill="${C.steel}" font-family="DejaVu Sans Mono" font-weight="700" font-size="44">632 → 0 MPH</text>
</svg>`;

const covers = {
  'cover-SH-01': () => shortCover({ kicker: 'Tested to destruction', art: wingArt, value: 154, rated: 100, max: 170, unit: '%', label: 'LIMIT LOAD', big: 'Broken on purpose', sub: 'Boeing 777 wing test · 1995' }),
  'cover-SH-02': () => shortCover({ kicker: 'Tested to destruction', art: shaftArt, value: 75, rated: 0, max: 80, unit: '', label: '', tickLabel: '', hideTick: true, big: 'Floors. She survived.', sub: 'Empire State Building · 1945' }),
  'cover-SH-03': () => shortCover({ kicker: 'The human rating', art: sledArt, value: 46.2, rated: 9, max: 50, unit: ' G', label: 'FIGHTER PILOT ≈', big: '1.4 seconds to stop', sub: 'John Paul Stapp · 1954' }),
};

// 4) Animated Rating Bar frame (t in 0..1) for the signature motion clip, 1080x1920.
function ratingBarFrame(t) {
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const v = Math.round(ease(Math.min(1, t / 0.8)) * 154);
  const flash = v > 100 ? Math.max(0, 1 - (t - 0.55) * 6) : 0;
  return base(1080, 1920, `
    <div style="position:absolute;inset:0;background:${C.orange};opacity:${(flash * 0.12).toFixed(3)}"></div>
    <div style="position:absolute;left:90px;top:520px">
      <div class="caps" style="font-weight:800;font-size:46px;color:${C.steel};letter-spacing:.06em;margin-bottom:40px">${v > 100 ? 'Past the rating' : 'Load'}</div>
      ${ratingBar({ width: 900, height: 44, value: v, rated: 100, max: 170, numberSize: 260 })}
    </div>
    <div style="position:absolute;left:0;right:0;top:1250px;display:flex;justify-content:center;opacity:${t > 0.85 ? Math.min(1, (t - 0.85) * 8) : 0}">${logo(150)}</div>`);
}

module.exports = { banner, thumbLF01, covers, ratingBarFrame };
