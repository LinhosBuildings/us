"use server";

import { z } from "zod";
import { requireRelationship } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { revalidatePath } from "next/cache";
import type { Confession, Letter, LockBehavior } from "@/lib/types";

function splitList(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ── Letters ─────────────────────────────────────────────────── */

const letterSchema = z.object({
  title: z.string().trim().min(1).max(220),
  category: z.enum(["to-you", "what-i-love", "never-forget", "thank-you", "im-sorry", "future-wife", "future-husband", "future-family", "when-were-old"]),
  body: z.string().min(1, "Write something — even a sentence.").max(20000),
  mediaIds: z.array(z.string()).max(20).default([]),
  lockAt: z.string().optional().nullable(),
});

export type LetterState = { error?: string };

export async function createLetter(_prev: LetterState, formData: FormData): Promise<LetterState> {
  const { user, relationship } = await requireRelationship();
  const parsed = letterSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    body: formData.get("body"),
    mediaIds: splitList(formData.get("mediaIds")),
    lockAt: formData.get("lockAt") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the letter." };
  const store = await getStore();
  await store.createLetter(relationship.id, user.id, {
    title: parsed.data.title,
    category: parsed.data.category,
    body: parsed.data.body,
    mediaIds: parsed.data.mediaIds,
    lockAt: parsed.data.lockAt,
  });
  revalidatePath("/letters", "page");
  return {};
}

export async function deleteLetter(letterId: string) {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  await store.deleteLetter(relationship.id, letterId);
  revalidatePath("/letters", "page");
  return { success: true };
}

/* ── Open When ───────────────────────────────────────────────── */

const openWhenSchema = z.object({
  title: z.string().trim().min(1).max(220),
  body: z.string().min(1).max(10000),
  mediaIds: z.array(z.string()).max(20).default([]),
  lockBehavior: z.enum(["immediate", "date", "interaction", "permanent"]),
  unlockAt: z.string().optional().nullable(),
  interactionHint: z.string().trim().max(400).optional().nullable(),
});

export type OpenWhenState = { error?: string };

export async function createOpenWhen(_prev: OpenWhenState, formData: FormData): Promise<OpenWhenState> {
  const { user, relationship } = await requireRelationship();
  const parsed = openWhenSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    mediaIds: splitList(formData.get("mediaIds")),
    lockBehavior: formData.get("lockBehavior"),
    unlockAt: formData.get("unlockAt") || null,
    interactionHint: formData.get("interactionHint") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the entry." };
  const store = await getStore();
  await store.createOpenWhen(relationship.id, user.id, parsed.data);
  revalidatePath("/open-when", "page");
  return {};
}

export async function unlockOpenWhen(entryId: string) {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  const entry = (await store.listOpenWhen(relationship.id)).find((x) => x.id === entryId);
  if (!entry) return { error: "Not found." };
  if (entry.lockBehavior === "date") {
    if (entry.unlockAt && new Date(entry.unlockAt).getTime() > Date.now()) {
      return { error: "Not yet. The date hasn't come." };
    }
  }
  if (entry.lockBehavior === "permanent") {
    return { error: "This one stays sealed. That's the point." };
  }
  await store.unlockOpenWhen(relationship.id, entryId);
  revalidatePath("/open-when", "page");
  return { success: true };
}

/* ── Confessions ─────────────────────────────────────────────── */

const confessionSchema = z.object({
  text: z.string().trim().min(1).max(5000),
  mediaIds: z.array(z.string()).max(10).default([]),
  visibility: z.enum(["private", "revealed", "reveal-on"]),
  revealAt: z.string().optional().nullable(),
});

export type ConfessionState = { error?: string };

export async function createConfession(_prev: ConfessionState, formData: FormData): Promise<ConfessionState> {
  const { user, relationship } = await requireRelationship();
  const parsed = confessionSchema.safeParse({
    text: formData.get("text"),
    mediaIds: splitList(formData.get("mediaIds")),
    visibility: formData.get("visibility") || "private",
    revealAt: formData.get("revealAt") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the confession." };
  const store = await getStore();
  await store.createConfession(relationship.id, user.id, {
    text: parsed.data.text,
    mediaIds: parsed.data.mediaIds,
    visibility: parsed.data.visibility,
    revealAt: parsed.data.revealAt,
  });
  revalidatePath("/confessions", "page");
  return {};
}

export async function updateConfession(id: string, visibility: Confession["visibility"]) {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  await store.updateConfession(relationship.id, id, { visibility });
  revalidatePath("/confessions", "page");
  return { success: true };
}

export async function deleteConfession(id: string) {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  await store.deleteConfession(relationship.id, id);
  revalidatePath("/confessions", "page");
  return { success: true };
}

/* ── Dictionary ──────────────────────────────────────────────── */

const dictSchema = z.object({
  word: z.string().trim().min(1).max(80),
  meaning: z.string().trim().min(1).max(1000),
  inventorName: z.string().trim().max(80).optional().nullable(),
  origin: z.string().trim().max(2000).optional().nullable(),
  example: z.string().trim().max(2000).optional().nullable(),
  usedSince: z.string().trim().max(20).optional().nullable(),
});

export type DictState = { error?: string };

export async function createDictionaryEntry(_prev: DictState, formData: FormData): Promise<DictState> {
  const { user, relationship } = await requireRelationship();
  const parsed = dictSchema.safeParse({
    word: formData.get("word"),
    meaning: formData.get("meaning"),
    inventorName: formData.get("inventorName") || null,
    origin: formData.get("origin") || null,
    example: formData.get("example") || null,
    usedSince: formData.get("usedSince") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the entry." };
  const store = await getStore();
  await store.createDictionaryEntry(relationship.id, user.id, {
    word: parsed.data.word.toUpperCase(),
    meaning: parsed.data.meaning,
    inventorId: user.id,
    inventorName: parsed.data.inventorName || user.name,
    origin: parsed.data.origin,
    example: parsed.data.example,
    usedSince: parsed.data.usedSince,
    audio: null,
  });
  revalidatePath("/dictionary", "page");
  return {};
}

/* ── Little things ───────────────────────────────────────────── */

const littleSchema = z.object({
  what: z.string().trim().min(1, "What happened?").max(1200),
  why: z.string().trim().max(1200).optional().nullable(),
  date: z.string().optional().nullable(),
  mediaIds: z.array(z.string()).max(10).default([]),
});

export type LittleState = { error?: string };

export async function createLittleThing(_prev: LittleState, formData: FormData): Promise<LittleState> {
  const { user, relationship } = await requireRelationship();
  const parsed = littleSchema.safeParse({
    what: formData.get("what"),
    why: formData.get("why") || null,
    date: formData.get("date") || null,
    mediaIds: splitList(formData.get("mediaIds")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the little thing." };
  const store = await getStore();
  await store.createLittleThing(relationship.id, user.id, {
    what: parsed.data.what,
    why: parsed.data.why,
    date: parsed.data.date,
    mediaIds: parsed.data.mediaIds,
  });
  revalidatePath("/memories", "page");
  return {};
}

/* ── Firsts ──────────────────────────────────────────────────── */

const firstSchema = z.object({
  title: z.string().trim().min(1).max(200),
  date: z.string().optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  custom: z.boolean().default(true),
});

export type FirstState = { error?: string };

export async function createFirst(_prev: FirstState, formData: FormData): Promise<FirstState> {
  const { user, relationship } = await requireRelationship();
  const parsed = firstSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date") || null,
    description: formData.get("description") || null,
    imageUrl: formData.get("imageUrl") || null,
    custom: true,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the first." };
  const store = await getStore();
  await store.createFirst(relationship.id, user.id, parsed.data);
  revalidatePath("/firsts", "page");
  return {};
}

/* used by the add-memory sheet to auto-create milestone chapter link */
export async function memoryKinds() {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  const chapters = await store.listChapters(relationship.id);
  return { chapters: chapters.map((c) => ({ id: c.id, title: c.title })) };
}

export type { LockBehavior, Letter };