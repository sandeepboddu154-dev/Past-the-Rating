// Money To Scale — shared 3D toolkit (Three.js). Real-world units: metres.
import * as THREE from 'three';
export const PAL={ink:0x0E0F12,floor:0x15171B,grid1:0x262a31,grid2:0x1b1e23,orange:0xFF6A1A,person:0x3a3f47};
// ₹500 (Mahatma Gandhi New Series): 150 x 66 mm. Thickness: RBI specification 110 microns per note (verified 17 Nov 2026).
export const NOTE500={w:0.150,d:0.066,bundleH:0.011,value:500,perBundle:100};   // RBI spec: 110 µm per note → 11 mm per 100-note bundle
export function makeRenderer(W,H){const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(W,H);r.setPixelRatio(1);
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.toneMapping=THREE.ACESFilmicToneMapping;r.outputColorSpace=THREE.SRGBColorSpace;return r;}
export function makeSet(scene,{fog=[8,26]}={}){scene.background=new THREE.Color(PAL.ink);scene.fog=new THREE.Fog(PAL.ink,fog[0],fog[1]);
  scene.add(new THREE.HemisphereLight(0xdfe6ee,0x101114,0.55));
  const key=new THREE.DirectionalLight(0xffffff,2.6);key.position.set(3,6,4);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-1,far:30});scene.add(key);
  const rim=new THREE.DirectionalLight(0xff7a3d,0.45);rim.position.set(-4,3,-3);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(30,64),new THREE.MeshStandardMaterial({color:PAL.floor,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const grid=new THREE.GridHelper(60,120,PAL.grid1,PAL.grid2);grid.position.y=0.001;scene.add(grid);return {key,rim,floor,grid};}
function noteTextures(){
  const cv=document.createElement('canvas');cv.width=512;cv.height=64;const g=cv.getContext('2d');
  g.fillStyle='#9a9a8c';g.fillRect(0,0,512,64);for(let i=0;i<64;i+=2){g.fillStyle=i%4?'#8d8d80':'#a6a697';g.fillRect(0,i,512,1);}g.fillStyle='#e8e2d0';g.fillRect(236,0,40,64);
  const tc=document.createElement('canvas');tc.width=600;tc.height=264;const t=tc.getContext('2d');const gr=t.createLinearGradient(0,0,600,264);gr.addColorStop(0,'#b7b5a4');gr.addColorStop(1,'#8f8d7e');
  t.fillStyle=gr;t.fillRect(0,0,600,264);t.strokeStyle='#6f6d60';t.lineWidth=6;t.strokeRect(10,10,580,244);t.fillStyle='#e8e2d0';t.fillRect(270,0,60,264);
  t.fillStyle='#4e4c43';t.font='bold 64px DejaVu Sans';t.fillText('500',40,90);t.beginPath();t.arc(470,140,70,0,Math.PI*2);t.fillStyle='#a3a190';t.fill();
  const a=new THREE.CanvasTexture(cv),b=new THREE.CanvasTexture(tc);a.colorSpace=b.colorSpace=THREE.SRGBColorSpace;return [a,b];}
let _mats=null;
export function bundleMaterials(){ if(_mats) return _mats; const [s,t]=noteTextures(); const side=new THREE.MeshStandardMaterial({map:s,roughness:.85}),top=new THREE.MeshStandardMaterial({map:t,roughness:.8});
  _mats=[side,side,top,top,side,side]; return _mats; }
// A column of n bundles (₹500): returns group; height = n * bundleH
export function bundleColumn(n,{x=0,z=0,jitter=0.012}={}){ const g=new THREE.Group(); const geo=new THREE.BoxGeometry(NOTE500.w,NOTE500.bundleH,NOTE500.d); const m=bundleMaterials();
  for(let i=0;i<n;i++){const b=new THREE.Mesh(geo,m);b.position.set(0,NOTE500.bundleH*(i+.5)+0.0005,0);b.rotation.y=(i%2?jitter:-jitter);b.castShadow=b.receiveShadow=true;g.add(b);} g.position.set(x,0,z); return g; }
// Stylised 1.75 m mannequin
export function person({x=0,z=0,height=1.75}={}){ const pm=new THREE.MeshStandardMaterial({color:PAL.person,roughness:.6}); const g=new THREE.Group();
  const cap=(r,l,px,py,rz=0)=>{const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,l,8,16),pm);m.position.set(px,py,0);m.rotation.z=rz;m.castShadow=true;g.add(m);};
  cap(0.065,0.74,-0.09,0.43);cap(0.065,0.74,0.09,0.43);cap(0.17,0.42,0,1.13);cap(0.05,0.56,-0.25,1.12,0.12);cap(0.05,0.56,0.25,1.12,-0.12);cap(0.05,0.04,0,1.50);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.11,32,20),pm);head.scale.set(1,1.18,1.05);head.position.y=1.62;head.castShadow=true;g.add(head);
  g.scale.setScalar(height/1.75); g.position.set(x,0,z); g.userData.head=head; return g; }
export function toScreen(v,cam,W,H){const p=v.clone().project(cam);return {x:(p.x+1)/2*W,y:(1-p.y)/2*H};}
export function inr(n){n=Math.round(n);const s=String(n);if(s.length<=3)return s;return s.slice(0,-3).replace(/\B(?=(\d{2})+(?!\d))/g,',')+','+s.slice(-3);}
export {THREE};
