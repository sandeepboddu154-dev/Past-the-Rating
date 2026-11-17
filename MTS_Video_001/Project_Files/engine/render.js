// MTS render: node render.js preview|full <timeline.json> <outdir> [scale] [workers]
const {chromium}=require('playwright'); const fs=require('fs'),path=require('path'),crypto=require('crypto'); const {spawn}=require('child_process');
const [,,mode,tlp,out,a3,a4]=process.argv; const TL=JSON.parse(fs.readFileSync(tlp)); const FPS=TL.fps;
const URL='http://127.0.0.1:8768/MTS_Video_001/Project_Files/engine/engine.html';
const eh=crypto.createHash('sha1').update(fs.readFileSync(path.join(__dirname,'engine.html'))).digest('hex').slice(0,10);
const only=process.env.ONLY?process.env.ONLY.split(','):null; const segs=TL.segments.filter(s=>!only||only.includes(s.id)); fs.mkdirSync(out,{recursive:true});
const ARGS=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
async function page(b,scale){ const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:scale}); p.on('pageerror',e=>console.error('PAGEERR',e.message)); await p.goto(URL); await p.waitForFunction('window.ready===true'); await p.evaluate(()=>document.fonts.ready); return p; }
async function frame(p,seg,t,q=92){ await p.evaluate(([s,tt])=>{ if(window.__sid!==s.id){window.setSegment(s);window.__sid=s.id;} window.renderFrame(tt); },[seg,t]); return p.screenshot({type:'jpeg',quality:q}); }
(async()=>{ const b=await chromium.launch({args:ARGS});
 if(mode==='preview'){ const sc=Number(a3||.5); const p=await page(b,sc);
   for(const s of segs){ const fl=[]; for(let i=0;i<6;i++){ const t=Math.min(s.dur-.05,(i+.5)*s.dur/6); const f=path.join(out,`${s.id}_${i}.jpg`); fs.writeFileSync(f,await frame(p,s,t)); fl.push(f);} 
     await new Promise(r=>spawn('convert',[...fl,'+append','-resize','50%',path.join(out,`${s.id}.jpg`)]).on('close',r)); fl.forEach(f=>fs.unlinkSync(f)); console.log('preview',s.id); }
 } else { const sc=Number(a3||2), workers=Number(a4||2); const q=segs.slice().sort((x,y)=>y.dur-x.dur);
   await Promise.all(Array.from({length:workers},async(_,wi)=>{ const p=await page(b,sc);
     while(q.length){ const s=q.shift(); const key=crypto.createHash('sha1').update(JSON.stringify(s)+eh+sc).digest('hex').slice(0,12);
       const o=path.join(out,s.id+'.mp4'); if(fs.existsSync(o)&&fs.existsSync(o+'.key')&&fs.readFileSync(o+'.key','utf8')===key){console.log(s.id,'cached');continue;}
       const n=Math.round(s.dur*FPS), t0=Date.now(); const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','-r',String(FPS),'-g',String(FPS*2),'-x264-params','threads=2',o+'.tmp.mp4']);
       for(let i=0;i<n;i++){ const buf=await frame(p,s,i/FPS,93); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); }
       ff.stdin.end(); if(await new Promise(r=>ff.on('close',r))) throw new Error('ffmpeg '+s.id); fs.renameSync(o+'.tmp.mp4',o); fs.writeFileSync(o+'.key',key); console.log(`[w${wi}] ${s.id} ${n}f ${((Date.now()-t0)/1000).toFixed(0)}s`); } }));
 } await b.close(); })().catch(e=>{console.error(e);process.exit(1);});
