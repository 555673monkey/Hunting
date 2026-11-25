import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'assets/models');fs.mkdirSync(dir,{recursive:true});
const models={
 'white-tailed-buck.glb':'https://vinish-models.pages.dev/deer-elk-and-moose/white-tailed-buck.glb',
 'white-tailed-doe.glb':'https://vinish-models.pages.dev/deer-elk-and-moose/white-tailed-doe.glb',
 'white-tailed-fawn.glb':'https://vinish-models.pages.dev/deer-elk-and-moose/white-tailed-fawn.glb',
 'mule-deer-buck.glb':'https://vinish-models.pages.dev/deer-elk-and-moose/mule-deer-buck.glb'
};
function download(url,dest){return new Promise((resolve,reject)=>{https.get(url,{headers:{'User-Agent':'FINAL-HUNT-game-asset-fetch/1.0'}},res=>{if(res.statusCode>=300&&res.statusCode<400&&res.headers.location){res.resume();return download(res.headers.location,dest).then(resolve,reject);}if(res.statusCode!==200){res.resume();return reject(new Error(`HTTP ${res.statusCode} for ${url}`));}const out=fs.createWriteStream(dest);res.pipe(out);out.on('finish',()=>out.close(()=>resolve()));out.on('error',reject);}).on('error',reject);});}
for(const [name,url] of Object.entries(models)){const dest=path.join(dir,name);if(fs.existsSync(dest)&&fs.statSync(dest).size>20000){console.log(`Using cached ${name}`);continue;}try{await download(url,dest);if(fs.statSync(dest).size<20000)throw new Error('File too small to be a GLB');console.log(`Downloaded ${name} (${(fs.statSync(dest).size/1024).toFixed(0)} KB)`);}catch(e){if(fs.existsSync(dest))fs.unlinkSync(dest);if(name==='white-tailed-buck.glb'){console.warn(`Animated whitetail buck unavailable (${e.message}); trying verified CC0 static whitetail from Grab3D.`);await download('https://grab3d.com/dl/deer/deer-light.glb',dest);if(fs.statSync(dest).size<100000)throw new Error('Grab3D fallback file is unexpectedly small');console.log(`Downloaded CC0 static whitetail fallback (${(fs.statSync(dest).size/1048576).toFixed(1)} MB)`);}else{console.error(`Could not fetch ${name}: ${e.message}`);throw e;}}}
