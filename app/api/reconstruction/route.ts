import { accessAllowed, badRequest, noStoreJson, validateInput } from "@/lib/reconstruction/provider";
import { gpuJson, localConfigured } from "@/lib/reconstruction/local-provider";

export const runtime = "nodejs";
export const maxDuration = 30;

const accessConfigured = () => (process.env.NITORIX_RECONSTRUCTION_ACCESS_KEY?.length ?? 0) >= 32;

export async function GET() {
  return noStoreJson({
    configured: localConfigured() && accessConfigured(),
    localAvailable: localConfigured(),
    requiresAccessKey: true,
  });
}
export async function POST(request: Request) {
  if (!localConfigured() || !accessConfigured())
    return badRequest("The private GPU reconstruction service is not configured.",503);
  if (!accessAllowed(request)) return badRequest("Invalid pilot access key.",401);
  if (Number(request.headers.get("content-length") ?? 0)>7_000_000)
    return badRequest("Photo payload exceeds the pilot limit.",413);
  try {
    const raw:unknown=await request.json();
    const input=validateInput(raw);
    const engine=(raw as {engine?:unknown}).engine;
    if(engine!=="fast" && engine!=="balanced" && engine!=="premium")
      return badRequest("Choose a local reconstruction engine.",400);
    const data=await gpuJson("/jobs",{
      method:"POST",
      body:JSON.stringify({...input,engine}),
    });
    if(typeof data.id!=="string"||!/^[0-9a-f-]{36}$/.test(data.id))
      return badRequest("GPU worker returned an invalid task ID.",502);
    return noStoreJson({id:`local_${data.id}`,status:"PENDING"},202);
  }catch(error){
    return badRequest(error instanceof Error?error.message:"Could not start local reconstruction.",502);
  }
}
