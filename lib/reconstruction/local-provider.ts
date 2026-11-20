import "server-only";
export type Engine = "fast" | "balanced" | "premium";
export const localConfigured = () => Boolean(process.env.NITORIX_GPU_URL && (process.env.NITORIX_GPU_TOKEN?.length ?? 0)>=32);
export async function gpuRequest(route:string,init?:RequestInit):Promise<Response>{
 if(!localConfigured())throw Error("The private GPU service is not configured.");
 const root=new URL(process.env.NITORIX_GPU_URL!);
 if(!["http:","https:"].includes(root.protocol))throw Error("Unsupported GPU service URL");
 if(root.protocol==="http:"&&!["localhost","127.0.0.1","::1"].includes(root.hostname))
  throw Error("Remote GPU services must use HTTPS.");
 const response=await fetch(new URL(route,root).href,{
  ...init,cache:"no-store",headers:{
   authorization:`Bearer ${process.env.NITORIX_GPU_TOKEN}`,
   ...(init?.body?{"content-type":"application/json"}:{})
  },
  signal:AbortSignal.timeout(60000)
 });
 return response;
}
export async function gpuJson(route:string,init?:RequestInit):Promise<Record<string,unknown>>{
 const response=await gpuRequest(route,init);
 const value:unknown=await response.json().catch(()=>({}));
 if(!response.ok){
  const message=(value as {error?:unknown}).error;
  throw Error(typeof message==="string"?message.slice(0,240):`GPU worker returned ${response.status}`);
 }
 return value as Record<string,unknown>;
}
export function publicGpuStatus(job:Record<string,unknown>){
 return {
  id:typeof job.id==="string"?job.id:"",
  status:typeof job.status==="string"?job.status:"PENDING",
  progress:typeof job.progress==="number"?job.progress:0,
  hasModel:job.hasModel===true,
  error:typeof job.error==="string"?job.error:undefined,
 };
}
