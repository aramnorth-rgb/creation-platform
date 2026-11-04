import { accessAllowed, badRequest, isTaskId, noStoreJson } from "@/lib/reconstruction/provider";
import { gpuJson, localConfigured, publicGpuStatus } from "@/lib/reconstruction/local-provider";

export const runtime="nodejs";
export const maxDuration=30;
export async function GET(request:Request,context:{params:Promise<{id:string}>}){
 if(!localConfigured())return badRequest("GPU reconstruction is not configured.",503);
 if(!accessAllowed(request))return badRequest("Invalid pilot access key.",401);
 const {id}=await context.params;
 if(!isTaskId(id)||!id.startsWith("local_"))return badRequest("Unknown local reconstruction task.",400);
 try {
  const data=await gpuJson("/jobs/"+encodeURIComponent(id.slice(6)));
  return noStoreJson({...publicGpuStatus(data),id});
 }catch(error){return badRequest(error instanceof Error?error.message:"GPU status unavailable.",502);}
}
