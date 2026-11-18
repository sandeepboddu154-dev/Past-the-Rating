// Lakhometer mark v4 (blend): gold serif L monogram + meter-arc swoosh that becomes a growth arrow + rising bars, in a fine ring.
export const PAL={ink:'#060A10',navy:'#0C1424',emer:'#0E3A2C',ivory:'#F2ECDD',gold1:'#FBEFC4',gold2:'#D9B566',gold3:'#9A7330',gold4:'#6E5020',green:'#37C978'};
const pol=(cx,cy,r,deg)=>{const a=deg*Math.PI/180;return [cx+r*Math.cos(a),cy-r*Math.sin(a)];};
export function mark({size=800,bg=true}={}){
  // swoosh: cubic Bézier from lower-left, under the L's foot, rising up the right side to the top-right
  const B=[[150,566],[290,716],[630,690],[668,232]]; const bz=t=>{const u=1-t;return [0,1].map(k=>u*u*u*B[0][k]+3*u*u*t*B[1][k]+3*u*t*t*B[2][k]+t*t*t*B[3][k]);};
  const pts=[]; for(let i=0;i<=80;i++) pts.push(bz(i/80));
  const swoosh=`M${B[0][0]} ${B[0][1]} C${B[1][0]} ${B[1][1]}, ${B[2][0]} ${B[2][1]}, ${B[3][0]} ${B[3][1]}`;
  const [ex,ey]=pts[80],[px,py]=pts[76]; const ang=Math.atan2(ey-py,ex-px);
  const ah=(dx,dy)=>[ex+dx*Math.cos(ang)-dy*Math.sin(ang), ey+dx*Math.sin(ang)+dy*Math.cos(ang)];
  const [h1x,h1y]=ah(30,0),[h2x,h2y]=ah(-26,-22),[h3x,h3y]=ah(-26,22);
  let ticks=''; for(let i=46;i<=74;i+=3){ const [x,y]=pts[i],[x2,y2]=pts[i+1]; const nx=-(y2-y),ny=(x2-x),l=Math.hypot(nx,ny); const len=i%6===2?26:16;
    ticks+=`<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x+nx/l*len).toFixed(1)}" y2="${(y+ny/l*len).toFixed(1)}" stroke="${i>62?PAL.green:PAL.gold2}" stroke-width="5" stroke-linecap="round"/>`; }
  const L='M250 176 H420 Q392 180 384 204 V538 H496 Q522 536 538 506 L552 470 L568 470 L552 620 H250 Q282 612 290 590 V204 Q282 180 250 176 Z';
  const bars=[[400,56],[438,94],[476,140]].map(([x,h],i)=>`<rect x="${x}" y="${528-h}" width="30" height="${h}" fill="url(#g4_gold)"/>${i===2?`<rect x="${x}" y="${528-h}" width="30" height="26" fill="${PAL.green}"/>`:''}`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 800 800"><defs>
   <linearGradient id="g4_gold" gradientUnits="userSpaceOnUse" x1="200" y1="150" x2="620" y2="660"><stop offset="0" stop-color="${PAL.gold1}"/><stop offset=".35" stop-color="${PAL.gold2}"/><stop offset=".7" stop-color="${PAL.gold3}"/><stop offset="1" stop-color="${PAL.gold2}"/></linearGradient>
   <linearGradient id="g4_sw" gradientUnits="userSpaceOnUse" x1="150" y1="0" x2="680" y2="0"><stop offset="0" stop-color="${PAL.gold4}"/><stop offset=".45" stop-color="${PAL.gold1}"/><stop offset=".75" stop-color="${PAL.gold2}"/><stop offset=".9" stop-color="${PAL.green}"/><stop offset="1" stop-color="${PAL.green}"/></linearGradient>
   <radialGradient id="g4_bg" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="${PAL.emer}"/><stop offset=".45" stop-color="${PAL.navy}"/><stop offset="1" stop-color="${PAL.ink}"/></radialGradient>
   <radialGradient id="g4_glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${PAL.gold2}" stop-opacity=".25"/><stop offset="1" stop-color="${PAL.gold2}" stop-opacity="0"/></radialGradient>
   <filter id="g4_sh"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".55"/></filter></defs>
   ${bg?`<rect width="800" height="800" fill="url(#g4_bg)"/>`:''}
   <circle cx="400" cy="400" r="290" fill="url(#g4_glow)"/>
   <path d="M ${pol(400,400,340,72)[0]} ${pol(400,400,340,72)[1]} A340 340 0 1 0 ${pol(400,400,340,38)[0]} ${pol(400,400,340,38)[1]}" fill="none" stroke="url(#g4_gold)" stroke-width="4"/>
   <g filter="url(#g4_sh)"><path d="${L}" fill="url(#g4_gold)"/><path d="${L}" fill="none" stroke="${PAL.gold1}" stroke-opacity=".6" stroke-width="2"/>${bars}</g>
   <g filter="url(#g4_sh)"><path d="${swoosh}" fill="none" stroke="url(#g4_sw)" stroke-width="18" stroke-linecap="round"/>${ticks}
   <path d="M${h1x.toFixed(1)} ${h1y.toFixed(1)} L${h2x.toFixed(1)} ${h2y.toFixed(1)} L${h3x.toFixed(1)} ${h3y.toFixed(1)} Z" fill="${PAL.green}"/></g>
  </svg>`; }
