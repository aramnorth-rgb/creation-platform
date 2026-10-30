import { accessAllowed, badRequest, meshProvider, noStoreJson, reconstructionConfigured, validateInput } from "@/lib/reconstruction/provider";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Paid API calls are only possible with an explicitly configured pilot credential. */
export async function GET() {
  return noStoreJson({ configured: reconstructionConfigured(), requiresAccessKey: true });
}
export async function POST(request: Request) {
  if (!reconstructionConfigured()) return badRequest("The reconstruction service has not been configured yet.", 503);
  if (!accessAllowed(request)) return badRequest("Invalid reconstruction access key.", 401);
  const size = Number(request.headers.get("content-length") ?? 0);
  if (size > 7_000_000) return badRequest("Photographs exceed the pilot upload limit.", 413);
  try {
    const input = validateInput(await request.json());
    const data = await meshProvider("", {
      method: "POST",
      body: JSON.stringify({
        image_urls: input.images,
        ai_model: "meshy-7.1",
        geometry_resolution: "standard",
        should_texture: true,
        enable_pbr: true,
        texture_resolution: "2k",
        image_enhancement: false,
        target_formats: ["glb"],
        moderation: true,
        ...(input.textureReference ? { texture_image_url: input.textureReference } : {}),
        ...(input.texturePrompt ? { texture_prompt: input.texturePrompt } : {}),
      }),
    });
    if (typeof data.result !== "string" || !/^[\w-]{8,100}$/.test(data.result)) {
      return badRequest("The model provider did not return a valid reconstruction ID.", 502);
    }
    return noStoreJson({ id: data.result, status: "PENDING" }, 202);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Reconstruction could not be started.", 400);
  }
}
