// Lakhometer mark v2: custom gold ₹, original faceted charging bull, Indian jali ring. (No State Emblem: protected by law.)
export const PAL={onyx:'#0B0B0D',ivory:'#F2ECDD',gold1:'#F6E6B0',gold2:'#D2AE62',gold3:'#8A6626',gold4:'#5E4416'};
const DEFS=`<defs>
 <linearGradient id="g_gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="800" y2="800"><stop offset="0" stop-color="${PAL.gold1}"/><stop offset=".42" stop-color="${PAL.gold2}"/><stop offset=".75" stop-color="${PAL.gold3}"/><stop offset="1" stop-color="${PAL.gold2}"/></linearGradient>
 <linearGradient id="g_gold_v" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="380"><stop offset="0" stop-color="${PAL.gold1}"/><stop offset=".5" stop-color="${PAL.gold2}"/><stop offset="1" stop-color="${PAL.gold4}"/></linearGradient>
 <radialGradient id="g_bg" cx=".5" cy=".4" r=".62"><stop offset="0" stop-color="#1D1A15"/><stop offset=".6" stop-color="#110F0D"/><stop offset="1" stop-color="${PAL.onyx}"/></radialGradient>
 <filter id="f_glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
// Indian jali (lattice) ring: ogee-arch motifs around the circle
function jali(cx,cy,r0,r1,n=40){ let s=''; const rm=(r0+r1)/2, h=(r1-r0);
  for(let i=0;i<n;i++){ const a=i/n*360; s+=`<g transform="rotate(${a} ${cx} ${cy}) translate(${cx} ${cy-rm})">
    <path d="M0 ${-h*.46} C ${h*.22} ${-h*.18}, ${h*.26} ${h*.12}, 0 ${h*.46} C ${-h*.26} ${h*.12}, ${-h*.22} ${-h*.18}, 0 ${-h*.46} Z" fill="none" stroke="url(#g_gold)" stroke-width="2.2"/>
    <circle cx="0" cy="0" r="${h*.07}" fill="url(#g_gold)"/>
    <path d="M${h*.36} ${-h*.40} L${h*.36} ${h*.40}" stroke="url(#g_gold)" stroke-width="1" opacity=".45" transform="rotate(${180/n*0} 0 0)"/></g>`; }
  return s; }
// Custom rupee glyph (strokes), designed in a 300x360 box
function rupee(){ const w=40; return `<g fill="none" stroke="url(#g_gold)" stroke-width="${w}" stroke-linecap="butt" stroke-linejoin="miter">
   <path d="M20 22 H282"/><path d="M20 104 H282"/>
   <path d="M118 22 C 250 22, 250 186, 118 186 H44"/><path d="M44 186 L222 352" stroke-linecap="square"/></g>
  <g fill="none" stroke="${PAL.gold1}" stroke-width="3" opacity=".8"><path d="M20 ${22-w/2+2} H282"/><path d="M20 ${104-w/2+2} H282"/></g>`; }
// Original faceted charging bull (facing left, head down), designed in a 640x380 box
const BULL='M40 250 L52 232 L84 214 L98 190 L92 176 L60 150 L40 112 L52 108 L78 140 L112 168 L128 160 L124 146 L104 112 L116 110 L142 150 L170 128 L232 92 L300 98 L380 118 L470 126 L530 132 L556 120 L600 70 L614 74 L576 132 L566 160 L572 200 L612 276 L640 336 L622 344 L586 290 L548 252 L536 290 L552 348 L532 350 L512 296 L500 262 L420 252 L330 256 L300 290 L262 330 L220 356 L210 344 L248 312 L268 282 L246 276 L196 318 L172 340 L162 330 L196 296 L222 262 L196 262 L160 262 L120 262 L84 262 L56 260 Z';
const FACETS=[['M128 160 L232 92 L300 98 L250 250 L196 262 Z',.30],['M98 190 L128 160 L196 262 L120 262 Z',.16],['M300 98 L380 118 L330 256 L250 250 Z',.10],['M470 126 L530 132 L566 160 L572 200 L548 252 L500 262 L420 252 Z',.14]];
function bull(){ return `<path d="${BULL}" fill="url(#g_gold_v)"/>`+FACETS.map(([d,o])=>`<path d="${d}" fill="${PAL.gold1}" opacity="${o}"/>`).join('')+`<path d="${BULL}" fill="none" stroke="${PAL.gold1}" stroke-width="2" opacity=".55"/>`; }
export function mark({size=800,bg=true,withBull=false}={}){
  const c=400;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 800 800">${DEFS}
   ${bg?`<rect width="800" height="800" fill="url(#g_bg)"/>`:''}
   <circle cx="${c}" cy="${c}" r="368" fill="none" stroke="url(#g_gold)" stroke-width="4"/>
   <circle cx="${c}" cy="${c}" r="356" fill="none" stroke="url(#g_gold)" stroke-width="1.2" opacity=".7"/>
   ${jali(c,c,300,350)}
   <circle cx="${c}" cy="${c}" r="294" fill="none" stroke="url(#g_gold)" stroke-width="3"/>
   <circle cx="${c}" cy="${c}" r="286" fill="#0E0D0B" opacity=".6"/>
   ${withBull?`<g transform="translate(250 132) scale(1.0)" filter="url(#f_glow)">${rupee()}</g><g transform="translate(398 588) scale(.62) translate(-340 -230)">${bull()}</g>`:`<g transform="translate(400 400) scale(1.12) translate(-151 -190)" filter="url(#f_glow)">${rupee()}</g>`}
  </svg>`; }
