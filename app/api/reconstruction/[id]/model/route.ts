import {gpuRequest,localConfigured} from "@/lib/reconstruction/local-provider";
import { accessAllowed, badRequest, isTaskId, reconstructionConfigured, streamGlb } from "@/lib/reconstruction/provider";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!reconstructionConfigured() && !localConfigured()) return badRequest("Reconstruction service is not configured.", 503);
  if (!accessAllowed(request)) return badRequest("Invalid reconstruction access key.", 401);
  const { id } = await context.params;
  if (!isTaskId(id)) return badRequest("Invalid reconstruction task ID.");
  try {
    if (id.startsWith("local_")) {
      if (!localConfigured()) return badRequest("GPU service is unavailable.",503);
      const response=await gpuRequest("/jobs/"+encodeURIComponent(id.slice(6))+"/model");
      if (!response.ok) return badRequest("The generated GPU model is not ready.",502);
      const data=await response.arrayBuffer();
      if(data.byteLength>30*1024*1024||data.byteLength<32) return badRequest("Generated GLB exceeds the allowed size.",502);
      return new Response(data,{status:200,headers:{"Content-Type":"model/gltf-binary","Cache-Control":"private, no-store","Content-Disposition":'attachment; filename="nitorix-model.glb"'}});
    }
    return await streamGlb(id);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to download the generated model.", 502);
  }
}
