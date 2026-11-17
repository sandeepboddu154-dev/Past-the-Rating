const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2}); await p.goto('http://127.0.0.1:8768/MTS_Video_001/Project_Files/engine/engine.html');
await p.waitForFunction('window.ready===true'); await p.evaluate(()=>document.fonts.ready);
await p.evaluate(()=>{window.setSegment({id:'TH',visual:'thumb',dur:2,words:[]}); window.renderFrame(1.0);}); await p.screenshot({path:process.argv[2]}); await b.close();})();
