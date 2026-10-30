import { accessAllowed, badRequest, isTaskId, reconstructionConfigured, streamGlb } from "@/lib/reconstruction/provider";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!reconstructionConfigured()) return badRequest("Reconstruction service is not configured.", 503);
  if (!accessAllowed(request)) return badRequest("Invalid reconstruction access key.", 401);
  const { id } = await context.params;
  if (!isTaskId(id)) return badRequest("Invalid reconstruction task ID.");
  try {
    return await streamGlb(id);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to download the generated model.", 502);
  }
}
