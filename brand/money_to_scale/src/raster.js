// Rasterise an SVG/HTML string to PNG with Chromium. usage: node raster.js in.svg out.png W H [transparent]
const {chromium}=require('playwright'); const fs=require('fs');
(async()=>{const [i,o,W,H,tr]=process.argv.slice(2); const b=await chromium.launch(); const p=await b.newPage({viewport:{width:+W,height:+H}});
await p.setContent(`<html><body style="margin:0;background:${tr?'transparent':'#0E0F12'}">${fs.readFileSync(i,'utf8').replace(/width="\d+" height="\d+"/,`width="${W}" height="${H}"`)}</body></html>`);
await p.screenshot({path:o,omitBackground:!!tr}); await b.close();})();
