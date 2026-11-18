// Lakhometer mark: guilloché seal + engraved gold L-square (a measuring instrument that is also the letter L).
export const PAL={onyx:'#0B0B0D',graphite:'#16171B',ivory:'#F2ECDD',stone:'#8E8A7E',gold1:'#F3E1A6',gold2:'#CBA65C',gold3:'#8A6626'};
function guilloche(cx,cy,r0,r1,lines=22,lobes=30){ let s=''; const N=720;
  for(let k=0;k<lines;k++){ const ph=k/lines*Math.PI*2/lobes*1.0, amp=(r1-r0)/2, mid=(r0+r1)/2; let d='';
    for(let i=0;i<=N;i++){ const t=i/N*Math.PI*2; const r=mid+amp*0.92*Math.sin(lobes*t+ph*lobes+0.6*Math.sin(5*t)); d+=(i?'L':'M')+(cx+r*Math.cos(t)).toFixed(2)+' '+(cy+r*Math.sin(t)).toFixed(2); }
    s+=`<path d="${d}Z" fill="none" stroke="url(#lg_gold)" stroke-width="0.9" opacity="${0.32+0.22*(k%4===0)}"/>`; }
  return s; }
export function mark({size=800,bg=true,seal=true}={}){
  const c=400; const A=46; // arm thickness
  const vx=318, top=232, bot=568, hr=548; // L geometry
  let ticks=''; for(let y=top+40;y<bot-A;y+=24){ const long=((y-top-40)/24)%4===0; ticks+=`<rect x="${vx+A-(long?26:15)}" y="${y}" width="${long?26:15}" height="3.2" fill="${PAL.gold3}" opacity=".9"/>`; }
  for(let x=vx+A+28;x<hr-6;x+=24){ const long=((x-vx-A-28)/24)%4===0; ticks+=`<rect x="${x}" y="${bot-A}" width="3.2" height="${long?26:15}" fill="${PAL.gold3}" opacity=".9"/>`; }
  const L=`<path d="M${vx} ${top} h${A} v${bot-top-A} h${hr-vx-A} v${A} h${-(hr-vx)} Z" fill="url(#lg_gold)"/>
    <path d="M${vx} ${top} h${A} v${bot-top-A} h${hr-vx-A} v${A} h${-(hr-vx)} Z" fill="none" stroke="${PAL.gold1}" stroke-opacity=".55" stroke-width="2"/>${ticks}
    <path d="M${vx+A+14} ${top+2} l22 -12 v24 z" fill="${PAL.ivory}"/>`;   // the single reading mark
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 800 800">
  <defs><linearGradient id="lg_gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${PAL.gold1}"/><stop offset=".45" stop-color="${PAL.gold2}"/><stop offset="1" stop-color="${PAL.gold3}"/></linearGradient>
  <radialGradient id="rg_bg" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#1B1C21"/><stop offset="1" stop-color="${PAL.onyx}"/></radialGradient></defs>
  ${bg?`<rect width="800" height="800" fill="url(#rg_bg)"/>`:''}
  ${seal?`<circle cx="${c}" cy="${c}" r="352" fill="none" stroke="url(#lg_gold)" stroke-width="3"/>${guilloche(c,c,300,342)}<circle cx="${c}" cy="${c}" r="292" fill="none" stroke="url(#lg_gold)" stroke-width="2"/>`:''}
  <g transform="translate(400 400) scale(1.14) translate(-418 -400)">${L}</g></svg>`; }
