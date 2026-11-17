// Fit SVG content to a square canvas with circle-safe padding, using the real bbox measured in Chromium.
const {chromium}=require('playwright'); const fs=require('fs');
(async()=>{const [i,o,pad]=process.argv.slice(2); const svg=fs.readFileSync(i,'utf8');
const b=await chromium.launch(); const p=await b.newPage(); await p.setContent(svg);
const bb=await p.evaluate(()=>{const g=document.querySelector('svg > g'); const r=g.getBBox(); const m=g.transform.baseVal.consolidate(); const e=m?m.matrix.e:0, f=m?m.matrix.f:0; return {x:r.x+e,y:r.y+f,w:r.width,h:r.height};});
const side=Math.max(bb.w,bb.h)*(1+2*Number(pad)); const cx=bb.x+bb.w/2, cy=bb.y+bb.h/2;
const out=svg.replace(/viewBox="[^"]+"/,`viewBox="${cx-side/2} ${cy-side/2} ${side} ${side}"`).replace(/<rect width="800" height="800"/,`<rect x="${cx-side/2}" y="${cy-side/2}" width="${side}" height="${side}"`);
fs.writeFileSync(o,out); console.log(bb,side); await b.close();})();
