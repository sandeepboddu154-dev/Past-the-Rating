const {chromium}=require('playwright'); const {spawn}=require('child_process');
(async()=>{const [out,dur]=[process.argv[2],Number(process.argv[3]||12)]; const fps=24;
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}}); await p.goto('http://127.0.0.1:8766/scene.html');
await p.waitForFunction('window.ready===true'); await p.evaluate(()=>document.fonts.ready);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-crf','17','-pix_fmt','yuv420p',out]);
for(let i=0;i<dur*fps;i++){ await p.evaluate(t=>window.renderAt(t),i/fps); const buf=await p.screenshot({type:'jpeg',quality:93}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); }
ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await b.close(); console.log('ok',out);})();
