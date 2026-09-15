"use server";

import { randomUUID } from "crypto";
import { getSessionUserId } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { isSupabaseConfigured, supabaseBucket } from "@/lib/supabase/admin";
import type { MediaType } from "@/lib/types";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB

export type UploadResult = { mediaId?: string; url?: string; error?: string };

function typeFromFile(name: string, mime: string): MediaType {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  const lower = name.toLowerCase();
  if (lower.endsWith(".mov") || lower.endsWith(".mkv") || lower.endsWith(".webm")) return "video";
  if (lower.endsWith(".mp3") || lower.endsWith(".m4a") || lower.endsWith(".wav")) return "audio";
  return "image";
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/heic": "heic",
    "image/heif": "heif",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
  };
  return map[mime] ?? "bin";
}

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Sign in first." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo, video, or voice note." };
  if (file.size > MAX_BYTES) return { error: "Keep files under 15MB." };

  const store = await getStore();
  const rel = await store.getRelationshipForUser(userId);
  if (!rel) return { error: "No universe yet — finish setup first." };

  const id = `med_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const type = typeFromFile(file.name, file.type);
  const mime = file.type || "application/octet-stream";
  const createdAt = new Date().toISOString();
  const bytes = Buffer.from(await file.arrayBuffer());
  const sizeBytes = bytes.length;

  let url: string;
  if (process.env.NEXT_PUBLIC_APP_MODE === "prod") {
    if (!isSupabaseConfigured()) return { error: "Storage isn't configured yet." };
    const bucket = supabaseBucket();
    if (!bucket) return { error: "Storage bucket isn't ready yet." };
    const path = `${rel.id}/${userId}/${id}.${extFromMime(mime)}`;
    const { error } = await bucket.upload(path, bytes, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) return { error: `Upload failed: ${error.message}` };
    url = bucket.getPublicUrl(path).data.publicUrl;
  } else {
    url = `data:${mime};base64,${bytes.toString("base64")}`;
  }

  await store.registerMedia(rel.id, {
    id,
    type,
    url,
    mime,
    sizeBytes,
    createdAt,
    width: null,
    height: null,
    durationMs: null,
  });

  return { mediaId: id };
}