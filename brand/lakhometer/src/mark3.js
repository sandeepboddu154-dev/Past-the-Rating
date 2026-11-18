// Lakhometer mark v3: precision gold rupee gauge. The needle swings into the green "growth" zone.
export const PAL={ink:'#070A11',navy:'#101A2C',ivory:'#F2ECDD',gold1:'#F7E7B4',gold2:'#D4AF63',gold3:'#8C6828',green:'#3FCB86'};
const pol=(cx,cy,r,deg)=>{const a=deg*Math.PI/180;return [cx+r*Math.cos(a),cy-r*Math.sin(a)];};
function arc(cx,cy,r,a0,a1){const [x0,y0]=pol(cx,cy,r,a0),[x1,y1]=pol(cx,cy,r,a1);return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${Math.abs(a0-a1)>180?1:0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;}
function rupee(w=40){ return `<g fill="none" stroke="url(#g3_gold)" stroke-width="${w}" stroke-linecap="butt"><path d="M20 22 H282"/><path d="M20 104 H282"/>
  <path d="M118 22 C 250 22, 250 186, 118 186 H44"/><path d="M44 186 L222 352" stroke-linecap="square"/></g>
  <g stroke="${PAL.gold1}" stroke-width="3" opacity=".8"><path d="M20 ${22-w/2+2} H282"/><path d="M20 ${104-w/2+2} H282"/></g>`; }
export function mark({size=800,bg=true}={}){
  const cx=400, cy=405, R=262, A0=210, A1=-30, G=40;   // gauge sweep 240°, green zone from 40° down to -30°
  let ticks=''; for(let i=0;i<=24;i++){ const a=A0-(A0-A1)*i/24, major=i%4===0; const [x0,y0]=pol(cx,cy,R-30,a),[x1,y1]=pol(cx,cy,R-(major?72:52),a);
    ticks+=`<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${a<=G?PAL.green:PAL.gold2}" stroke-width="${major?7:3}" stroke-linecap="round" opacity="${major?1:.75}"/>`; }
  const NA=18; const [nx,ny]=pol(cx,cy,R-58,NA), [bx1,by1]=pol(cx,cy,30,NA+90),[bx2,by2]=pol(cx,cy,30,NA-90),[tx,ty]=pol(cx,cy,-46,NA);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 800 800"><defs>
   <linearGradient id="g3_gold" gradientUnits="userSpaceOnUse" x1="120" y1="120" x2="680" y2="700"><stop offset="0" stop-color="${PAL.gold1}"/><stop offset=".45" stop-color="${PAL.gold2}"/><stop offset=".8" stop-color="${PAL.gold3}"/><stop offset="1" stop-color="${PAL.gold2}"/></linearGradient>
   <linearGradient id="g3_arc" gradientUnits="userSpaceOnUse" x1="140" y1="0" x2="660" y2="0"><stop offset="0" stop-color="${PAL.gold3}"/><stop offset=".35" stop-color="${PAL.gold1}"/><stop offset=".66" stop-color="${PAL.gold2}"/><stop offset=".78" stop-color="${PAL.gold2}"/><stop offset=".92" stop-color="${PAL.green}"/><stop offset="1" stop-color="${PAL.green}"/></linearGradient>
   <radialGradient id="g3_bg" cx=".5" cy=".42" r=".65"><stop offset="0" stop-color="#16233A"/><stop offset=".55" stop-color="${PAL.navy}"/><stop offset="1" stop-color="${PAL.ink}"/></radialGradient>
   <radialGradient id="g3_glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${PAL.gold2}" stop-opacity=".22"/><stop offset="1" stop-color="${PAL.gold2}" stop-opacity="0"/></radialGradient>
   <filter id="g3_soft"><feGaussianBlur stdDeviation="5"/></filter></defs>
   ${bg?`<rect width="800" height="800" fill="url(#g3_bg)"/>`:''}
   <circle cx="${cx}" cy="${cy-20}" r="300" fill="url(#g3_glow)"/>
   <circle cx="400" cy="400" r="372" fill="none" stroke="url(#g3_gold)" stroke-width="3" opacity=".9"/>
   <circle cx="400" cy="400" r="362" fill="none" stroke="url(#g3_gold)" stroke-width="1" opacity=".5"/>
   <path d="${arc(cx,cy,R,A0,A1)}" fill="none" stroke="url(#g3_arc)" stroke-width="34" stroke-linecap="round"/>
   <path d="${arc(cx,cy,R+24,A0,A1)}" fill="none" stroke="url(#g3_gold)" stroke-width="2" opacity=".55"/>
   ${ticks}
   <g transform="translate(${cx} ${cy+150}) scale(.5) translate(-151 -187)">${rupee(44)}</g>
   <path d="M${bx1.toFixed(1)} ${by1.toFixed(1)} L${nx.toFixed(1)} ${ny.toFixed(1)} L${bx2.toFixed(1)} ${by2.toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)} Z" fill="url(#g3_gold)"/>
   <path d="M${cx} ${cy} L${nx.toFixed(1)} ${ny.toFixed(1)}" stroke="${PAL.gold1}" stroke-width="2" opacity=".8"/>
   <circle cx="${cx}" cy="${cy}" r="34" fill="url(#g3_gold)"/><circle cx="${cx}" cy="${cy}" r="18" fill="${PAL.ink}"/><circle cx="${cx}" cy="${cy}" r="6" fill="${PAL.gold1}"/>
   <path d="${arc(cx,cy,R+24,40,-30)}" fill="none" stroke="${PAL.green}" stroke-width="10" stroke-linecap="round" opacity=".35" filter="url(#g3_soft)"/>
  </svg>`; }
