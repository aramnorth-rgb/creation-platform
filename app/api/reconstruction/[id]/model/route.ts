import { accessAllowed, badRequest, isTaskId } from "@/lib/reconstruction/provider";
import { gpuRequest, localConfigured } from "@/lib/reconstruction/local-provider";

export const runtime="nodejs";
export const maxDuration=60;
export async function GET(request:Request,context:{params:Promise<{id:string}>}){
 if(!localConfigured())return badRequest("GPU reconstruction is not configured.",503);
 if(!accessAllowed(request))return badRequest("Invalid pilot access key.",401);
 const {id}=await context.params;
 if(!isTaskId(id)||!id.startsWith("local_"))return badRequest("Unknown local reconstruction task.",400);
 try {
  const response=await gpuRequest("/jobs/"+encodeURIComponent(id.slice(6))+"/model");
  if(!response.ok)return badRequest("The model is not available.",502);
  const data=await response.arrayBuffer();
  if(data.byteLength<32||data.byteLength>30*1024*1024)return badRequest("Invalid generated GLB size.",502);
  const view=new DataView(data);
  if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==data.byteLength)
    return badRequest("The GPU worker returned invalid GLB geometry.",502);
  return new Response(data,{status:200,headers:{
   "Content-Type":"model/gltf-binary",
   "Cache-Control":"private, no-store",
   "Content-Disposition":'attachment; filename="nitorix-reconstruction.glb"',
   "X-Content-Type-Options":"nosniff"
  }});
 }catch(error){return badRequest(error instanceof Error?error.message:"Model download failed.",502);}
}
