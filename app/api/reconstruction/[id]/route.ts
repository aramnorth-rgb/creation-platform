import { accessAllowed, badRequest, isTaskId, jobSummary, meshProvider, noStoreJson, reconstructionConfigured } from "@/lib/reconstruction/provider";

export const runtime = "nodejs";
export const maxDuration = 30;
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!reconstructionConfigured()) return badRequest("Reconstruction service is not configured.", 503);
  if (!accessAllowed(request)) return badRequest("Invalid reconstruction access key.", 401);
  const { id } = await context.params;
  if (!isTaskId(id)) return badRequest("Invalid reconstruction task ID.");
  try {
    const data = await meshProvider("/" + encodeURIComponent(id));
    return noStoreJson(jobSummary(data));
  } catch {
    return badRequest("Could not retrieve the reconstruction status.", 502);
  }
}
