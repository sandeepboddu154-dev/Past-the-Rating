const {chromium}=require('playwright');(async()=>{const [url,out,W,H]=process.argv.slice(2);
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:+W,height:+H}});await p.goto(url);await p.waitForFunction('window.ready===true',{timeout:60000});await p.evaluate(()=>document.fonts.ready);
await p.waitForTimeout(300);await p.screenshot({path:out});await b.close();})();
