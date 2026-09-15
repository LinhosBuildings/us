"use server";

import { z } from "zod";
import { requireRelationship } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { revalidatePath } from "next/cache";
import type { Memory } from "@/lib/types";

const createMemorySchema = z.object({
  title: z.string().trim().min(1, "Give it a title — even a small one.").max(200),
  kind: z.enum(["photo", "video", "voice", "text", "conversation", "place", "milestone", "little-thing"]),
  date: z.string().min(1, "When did it happen?"),
  description: z.string().max(6000).optional().default(""),
  locationName: z.string().trim().max(160).optional().nullable(),
  mood: z.enum(["joy", "love", "laughter", "tenderness", "peace", "yearning", "ache", "pride", "grateful", "wonder", "homesick", "ordinary"]).optional().nullable(),
  people: z.array(z.string().trim().max(80)).max(20).default([]),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  mediaIds: z.array(z.string()).max(40).default([]),
  songTitle: z.string().trim().max(160).optional().nullable(),
  songArtist: z.string().trim().max(160).optional().nullable(),
  songUrl: z.string().trim().max(500).optional().nullable(),
  visibility: z.enum(["both", "me-only"]).default("both"),
  neverTold: z.string().max(3000).optional().nullable(),
  constellationX: z.number().min(0).max(1).optional().nullable(),
  constellationY: z.number().min(0).max(1).optional().nullable(),
  chapterId: z.string().optional().nullable(),
  milestoneLabel: z.string().trim().max(120).optional().nullable(),
});

export type MemoryActionState = { error?: string };

export async function createMemory(_prev: MemoryActionState, formData: FormData) {
  const { user, relationship } = await requireRelationship();
  const parsed = createMemorySchema.safeParse({
    title: formData.get("title"),
    kind: formData.get("kind"),
    date: formData.get("date"),
    description: formData.get("description") || undefined,
    locationName: formData.get("locationName") || null,
    mood: formData.get("mood") || null,
    people: splitList(formData.get("people")),
    tags: splitList(formData.get("tags")),
    mediaIds: splitList(formData.get("mediaIds")),
    songTitle: formData.get("songTitle") || null,
    songArtist: formData.get("songArtist") || null,
    songUrl: formData.get("songUrl") || null,
    visibility: formData.get("visibility") || "both",
    neverTold: formData.get("neverTold") || null,
    chapterId: formData.get("chapterId") || null,
    milestoneLabel: formData.get("milestoneLabel") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the details." };

  const store = await getStore();
  const hasSong = Boolean(parsed.data.songTitle && parsed.data.songArtist);
  await store.createMemory(relationship.id, user.id, {
    title: parsed.data.title,
    kind: parsed.data.kind,
    date: new Date(parsed.data.date).toISOString(),
    description: parsed.data.description,
    locationName: parsed.data.locationName,
    mood: parsed.data.mood,
    people: parsed.data.people,
    tags: parsed.data.tags,
    mediaIds: parsed.data.mediaIds,
    song: hasSong
      ? { title: parsed.data.songTitle!, artist: parsed.data.songArtist!, externalUrl: parsed.data.songUrl }
      : null,
    visibility: parsed.data.visibility,
    neverTold: parsed.data.neverTold,
    constellationX: parsed.data.constellationX,
    constellationY: parsed.data.constellationY,
    chapterId: parsed.data.chapterId,
    milestoneLabel: parsed.data.milestoneLabel,
  });
  revalidatePath("/", "page");
  return {};
}

export async function updateMemory(memoryId: string, formData: FormData) {
  const { user, relationship } = await requireRelationship();
  const store = await getStore();
  const memory = await store.getMemory(relationship.id, memoryId);
  if (!memory || (memory.createdBy !== user.id && memory.visibility !== "both")) return { error: "Not found." };

  const title = String(formData.get("title") ?? "").trim() || memory.title;
  const description = String(formData.get("description") ?? "");
  const date = String(formData.get("date") ?? memory.date);
  const locationName = String(formData.get("locationName") ?? "") || null;
  const visibility: Memory["visibility"] = formData.get("visibility") === "me-only" ? "me-only" : "both";

  const rel = await store.updateMemory(relationship.id, memoryId, {
    title,
    description,
    date: new Date(date).toISOString(),
    locationName,
    visibility,
    neverTold: memory.neverTold,
  });
  if (rel) revalidatePath("/memories/" + memoryId, "page");
  return {};
}

export async function deleteMemory(memoryId: string) {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  await store.deleteMemory(relationship.id, memoryId);
  revalidatePath("/", "page");
  revalidatePath("/memories", "page");
  return { success: true };
}

export async function addPerspective(memoryId: string, text: string) {
  const { user, relationship } = await requireRelationship();
  const store = await getStore();
  if (!text.trim()) return { error: "Write something." };
  const memory = await store.getMemory(relationship.id, memoryId);
  if (!memory) return { error: "Memory not found." };
  await store.addPerspective(relationship.id, memoryId, user.id, text.trim());
  revalidatePath("/memories/" + memoryId, "page");
  return {};
}

function splitList(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}