import "server-only";
import { timingSafeEqual } from "node:crypto";

const MESHY_BASE = "https://api.meshy.ai/openapi/v1/multi-image-to-3d";
const MAX_PAYLOAD_CHARACTERS = 5_000_000;
const IMAGE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const TASK_ID = /^[a-zA-Z0-9_-]{8,100}$/;
const BODY_LIMIT = 12 * 1024 * 1024;

/**
 * Pilot-only gate until real manufacturer accounts / billing / quotas exist.
 * Never expose MESHIY_API_KEY or the gate through NEXT_PUBLIC variables.
 */
export function reconstructionConfigured() {
  return Boolean(process.env.MESHY_API_KEY && process.env.NITORIX_RECONSTRUCTION_ACCESS_KEY);
}
export function accessAllowed(req: Request) {
  const secret = process.env.NITORIX_RECONSTRUCTION_ACCESS_KEY;
  const supplied = req.headers.get("x-nitorix-reconstruction-key");
  if (!secret || secret.length < 16 || !supplied) return false;
  const a = Buffer.from(secret, "utf8"), b = Buffer.from(supplied, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
export function noStoreJson(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}
export function badRequest(message: string, code = 400) {
  return noStoreJson({ error: message }, code);
}
export function isTaskId(id: unknown): id is string {
  return typeof id === "string" && TASK_ID.test(id);
}
export type CreateInput = {
  images: string[];
  textureReference?: string | null;
  texturePrompt?: string | null;
};
export function validateInput(input: unknown): CreateInput {
  if (!input || typeof input !== "object") throw new Error("Invalid reconstruction request.");
  const { images, textureReference, texturePrompt } = input as Partial<CreateInput>;
  if (!Array.isArray(images) || images.length < 1 || images.length > 4 ||
      images.some(img => typeof img !== "string" || img.length > 1_750_000 || !IMAGE.test(img)))
    throw new Error("Provide between 1 and 4 JPEG, PNG or WebP photographs (max 1.75 MB encoded each).");
  if (images.join("").length > MAX_PAYLOAD_CHARACTERS)
    throw new Error("Please use smaller photographs before submitting.");
  if (textureReference && (typeof textureReference !== "string" ||
      textureReference.length > 1_750_000 || !IMAGE.test(textureReference)))
    throw new Error("Material reference must be one small JPEG, PNG or WebP image.");
  if (texturePrompt && (typeof texturePrompt !== "string" || texturePrompt.length > 600))
    throw new Error("Material instructions must be at most 600 characters.");
  if (textureReference && texturePrompt) throw new Error("Choose either a material photograph or text instructions.");
  return { images, textureReference, texturePrompt };
}
export async function meshProvider(path: string, options?: RequestInit) {
  if (!process.env.MESHY_API_KEY) throw new Error("Reconstruction provider is not configured.");
  const response = await fetch(MESHY_BASE + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof (body as { message?: unknown }).message === "string"
      ? (body as { message: string }).message
      : `Generation provider returned HTTP ${response.status}.`;
    throw new Error(message.slice(0, 240));
  }
  return body as Record<string, unknown>;
}
export function jobSummary(raw: Record<string, unknown>) {
  const status = String(raw.status ?? "PENDING");
  const validStatus = ["PENDING", "IN_PROGRESS", "SUCCEEDED", "FAILED", "CANCELED"].includes(status)
    ? status : "PENDING";
  const taskError = raw.task_error as { message?: unknown } | undefined;
  return {
    id: String(raw.id ?? ""),
    status: validStatus,
    progress: typeof raw.progress === "number" && Number.isFinite(raw.progress)
      ? Math.max(0, Math.min(100, raw.progress)) : 0,
    error: validStatus === "FAILED" && typeof taskError?.message === "string"
      ? taskError.message.slice(0, 320) : undefined,
    hasModel: validStatus === "SUCCEEDED" &&
      typeof (raw.model_urls as { glb?: unknown } | undefined)?.glb === "string",
  };
}
export async function modelDownloadUrl(id: string): Promise<string> {
  const job = await meshProvider(`/${encodeURIComponent(id)}`);
  if (job.status !== "SUCCEEDED") throw new Error("This model is not ready for download.");
  const link = (job.model_urls as { glb?: unknown } | undefined)?.glb;
  if (typeof link !== "string") throw new Error("The generator did not return a GLB model.");
  const url = new URL(link);
  if (url.protocol !== "https:" || (url.hostname !== "assets.meshy.ai" && !url.hostname.endsWith(".meshy.ai")))
    throw new Error("Unexpected model download host.");
  return url.href;
}
export async function streamGlb(id: string): Promise<Response> {
  const url = await modelDownloadUrl(id);
  const upstream = await fetch(url, { cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(45000) });
  if (!upstream.ok || !upstream.body) {
    upstream.body?.cancel().catch(() => {});
    throw new Error("Model download is unavailable. Check the task and try again.");
  }
  const expectedSize = Number(upstream.headers.get("content-length") ?? 0);
  if (expectedSize > BODY_LIMIT) {
    upstream.body.cancel().catch(() => {});
    throw new Error("Generated model exceeds the 12 MB local preview limit.");
  }
  let received = 0;
  const capped = upstream.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      received += chunk.byteLength;
      if (received > BODY_LIMIT) controller.error(new Error("Model exceeds the local preview limit."));
      else controller.enqueue(chunk);
    },
  }));
  return new Response(capped, {
    status: 200,
    headers: {
      "Content-Type": "model/gltf-binary",
      "Content-Disposition": 'attachment; filename="nitorix-reconstruction.glb"',
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
