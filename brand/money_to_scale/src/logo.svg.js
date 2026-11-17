// Money To Scale logo mark v2: three columns of banknote bundles rising 1:2:4 beside a measuring rule.
// Front view with a shallow oblique depth face so it stays legible at 48 px.
const C={ink:'#0E0F12',paper:'#EDE7D6',paperS:'#CFC8B3',paperD:'#9E977F',orange:'#FF6A1A',orangeD:'#C24A0C'};
const BW=150, BH=92, DX=26, DY=-18, GAP=34;
function bundle(x,y,hi){ // x,y = top-left of front face
  const strap=hi?C.orange:C.paperS, strapTop=hi?C.orangeD:C.paperD;
  return `<path d="M${x} ${y} l${DX} ${DY} h${BW} l${-DX} ${-DY} z" fill="${C.paper}"/>`+          // top face
    `<path d="M${x+BW} ${y} l${DX} ${DY} v${BH} l${-DX} ${-DY} z" fill="${C.paperD}"/>`+                 // side face
    `<rect x="${x}" y="${y}" width="${BW}" height="${BH}" fill="${C.paper}"/>`+                         // front face
    `<rect x="${x+BW*0.42}" y="${y}" width="${BW*0.16}" height="${BH}" fill="${strap}"/>`+             // strap (front)
    `<path d="M${x+BW*0.42} ${y} l${DX} ${DY} h${BW*0.16} l${-DX} ${-DY} z" fill="${strapTop}"/>`+     // strap (top)
    `<rect x="${x}" y="${y+BH-7}" width="${BW}" height="7" fill="${C.paperD}" opacity=".55"/>`;        // seam
}
function column(x,base,n,hi){ let s=''; for(let i=n-1;i>=0;i--) s+=bundle(x,base-(i+1)*BH,hi&&i===n-1); return s; }
function mark(size=800){
  const base=700; let s='';
  s+=column(60,base,1,false)+column(60+BW+GAP,base,2,false)+column(60+2*(BW+GAP),base,4,true);
  const rx=60+3*(BW+GAP)+DX+62, top=base-4*BH;
  s+=`<rect x="${rx}" y="${top}" width="18" height="${4*BH}" fill="${C.paper}"/>`;
  for(let i=1;i<8;i++){ const y=base-i*BH/2; s+=`<rect x="${rx-(i%2?22:40)}" y="${y-5}" width="${i%2?22:40}" height="10" fill="${C.paper}"/>`; }
  s+=`<rect x="${rx-70}" y="${top-7}" width="${18+70+22}" height="14" fill="${C.orange}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 800 800"><rect width="800" height="800" fill="${C.ink}"/><g>${s}</g></svg>`;
}
module.exports={mark,C};
if(require.main===module){ require('fs').writeFileSync(process.argv[2]||'logo.svg',mark(800)); }
