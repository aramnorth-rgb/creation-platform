// Private GPU worker: install TripoSR and/or trellis.cpp separately.
// Node 22, no external packages. Only one job runs at a time.
import http from "node:http";
import {randomUUID,timingSafeEqual} from "node:crypto";
import {mkdtemp,readFile,rm,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";
const secret=process.env.NITORIX_GPU_TOKEN||"";
if(secret.length<32)throw Error("Set NITORIX_GPU_TOKEN to a 32+ character secret.");
const jobs=new Map(),queue=[];let busy=false;
const available=()=>({fast:!!process.env.TRIPOSR_ROOT,balanced:!!(process.env.TRELLIS_CLI&&process.env.TRELLIS_Q4),premium:!!(process.env.TRELLIS_CLI&&process.env.TRELLIS_Q8)});
const reply=(res,status,data)=>{res.writeHead(status,{"content-type":"application/json","cache-control":"no-store"});res.end(JSON.stringify(data));};
async function readJson(req){const chunks=[];let n=0;for await(const chunk of req){n+=chunk.length;if(n>7e6)throw Error("Request too large.");chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString());}
async function execute(cmd,args,cwd){await new Promise((ok,fail)=>{const p=spawn(cmd,args,{cwd,stdio:"ignore",shell:false});const timeout=setTimeout(()=>p.kill(),900000);p.once("error",fail);p.once("close",code=>{clearTimeout(timeout);code===0?ok():fail(Error("3D engine exited with code "+code));});});}
async function next(){
 if(busy||!queue.length)return;busy=true;const job=queue.shift();job.status="IN_PROGRESS";
 try{
  const input=path.join(job.dir,"photo.jpg");await writeFile(input,job.bytes);job.bytes=null;
  let output;
  if(job.engine==="fast"){
   output=path.join(job.dir,"result","0","mesh.glb");
   await execute(process.env.TRIPOSR_PYTHON||"python",["run.py",input,"--output-dir",path.join(job.dir,"result"),"--model-save-format","glb","--chunk-size","2048","--mc-resolution","128"],path.resolve(process.env.TRIPOSR_ROOT));
  }else{
   output=path.join(job.dir,"model.glb");
   const weights=path.resolve(job.engine==="balanced"?process.env.TRELLIS_Q4:process.env.TRELLIS_Q8);
   await execute(path.resolve(process.env.TRELLIS_CLI),[input,output,"--models",weights,"--res",job.engine==="balanced"?"512":"1024","--require-gpu"],job.dir);
  }
  const glb=await readFile(output);
  if(glb.length<32||glb.length>30*1024*1024||glb.readUInt32LE(0)!==0x46546c67||glb.readUInt32LE(4)!==2)throw Error("Invalid or oversized GLB.");
  job.model=output;job.progress=100;job.status="SUCCEEDED";
 }catch(e){job.status="FAILED";job.error=String(e.message).slice(0,250);}
 finally{busy=false;queueMicrotask(next);}
}
async function handle(req,res){
 try{
  const a=Buffer.from(secret),b=Buffer.from((req.headers.authorization||"").replace(/^Bearer /,""));
  if(a.length!==b.length||!timingSafeEqual(a,b))return reply(res,401,{error:"Unauthorized"});
  const route=new URL(req.url,"http://localhost").pathname;
  if(route==="/health"&&req.method==="GET")return reply(res,200,{engines:available(),queued:queue.length});
  if(route==="/jobs"&&req.method==="POST"){
   if(queue.length>=3)return reply(res,429,{error:"Queue full"});
   const body=await readJson(req),engine=body?.engine;
   if(!["fast","balanced","premium"].includes(engine)||!available()[engine])return reply(res,503,{error:"Engine not configured"});
   const images=body.images;
   if(!Array.isArray(images)||!images.length||images.length>4||!images.every(x=>typeof x==="string"&&/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(x)))return reply(res,400,{error:"Invalid images"});
   if(!images[0].startsWith("data:image/jpeg;"))return reply(res,400,{error:"First image must be JPEG"});
   if(body.textureReference||body.texturePrompt)return reply(res,422,{error:"Local reference texture transfer not yet supported"});
   const bytes=Buffer.from(images[0].split(",")[1],"base64");
   if(bytes.length<64||bytes.length>1500000)return reply(res,400,{error:"Image size invalid"});
   const id=randomUUID(),dir=await mkdtemp(path.join(tmpdir(),"nx-"));
   const job={id,dir,bytes,engine,status:"PENDING",progress:0,created:Date.now()};
   jobs.set(id,job);queue.push(job);queueMicrotask(next);
   return reply(res,202,{id,status:"PENDING"});
  }
  const match=route.match(/^\/jobs\/([0-9a-f-]{36})(\/model)?$/),job=match&&jobs.get(match[1]);
  if(!job||req.method!=="GET")return reply(res,404,{error:"Not found"});
  if(match[2]){
   if(!job.model)return reply(res,409,{error:"Not ready"});
   const file=await readFile(job.model);
   res.writeHead(200,{"content-type":"model/gltf-binary","content-length":file.length,"cache-control":"no-store"});
   return res.end(file);
  }
  return reply(res,200,{id:job.id,status:job.status,progress:job.progress,hasModel:!!job.model,error:job.error});
 }catch(e){return reply(res,400,{error:String(e.message).slice(0,250)});}
}
http.createServer((req,res)=>{void handle(req,res)}).listen(Number(process.env.NITORIX_GPU_PORT||8765),process.env.NITORIX_GPU_BIND||"127.0.0.1");
setInterval(async()=>{for(const [id,job] of jobs)if(job.status!=="IN_PROGRESS"&&Date.now()-job.created>7200000){jobs.delete(id);await rm(job.dir,{recursive:true,force:true}).catch(()=>{});}},900000).unref();
