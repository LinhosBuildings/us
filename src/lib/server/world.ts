"use server";

import { z } from "zod";
import { requireRelationship } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { revalidatePath } from "next/cache";
import { REFLECTION_QUESTIONS } from "@/lib/types";

function splitList(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ── Places ──────────────────────────────────────────────────── */

const placeSchema = z.object({
  name: z.string().trim().min(1).max(160),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  date: z.string().optional().nullable(),
  story: z.string().trim().max(3000).optional().nullable(),
  memoryIds: z.array(z.string()).max(40).default([]),
});

export type PlaceState = { error?: string };

export async function createPlace(_prev: PlaceState, formData: FormData): Promise<PlaceState> {
  const { relationship } = await requireRelationship();
  const parsed = placeSchema.safeParse({
    name: formData.get("name"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    date: formData.get("date") || null,
    story: formData.get("story") || null,
    memoryIds: splitList(formData.get("memoryIds")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the location." };
  const store = await getStore();
  await store.createPlace(relationship.id, parsed.data);
  revalidatePath("/world", "page");
  return {};
}

/* ── Soundtrack ──────────────────────────────────────────────── */

const songSchema = z.object({
  title: z.string().trim().min(1).max(200),
  artist: z.string().trim().min(1).max(200),
  externalUrl: z.string().trim().max(500).optional().nullable(),
  memoryTitle: z.string().trim().max(200).optional().nullable(),
  why: z.string().trim().max(2000).optional().nullable(),
  date: z.string().optional().nullable(),
});

export type SongState = { error?: string };

export async function addSoundtrackSong(_prev: SongState, formData: FormData): Promise<SongState> {
  const { relationship } = await requireRelationship();
  const parsed = songSchema.safeParse({
    title: formData.get("title"),
    artist: formData.get("artist"),
    externalUrl: formData.get("externalUrl") || null,
    memoryTitle: formData.get("memoryTitle") || null,
    why: formData.get("why") || null,
    date: formData.get("date") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the song." };
  const store = await getStore();
  await store.addSoundtrackSong(relationship.id, parsed.data);
  revalidatePath("/soundtrack", "page");
  return {};
}

export async function removeSoundtrackSong(id: string) {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  await store.removeSoundtrackSong(relationship.id, id);
  revalidatePath("/soundtrack", "page");
  return { success: true };
}

/* ── Goals / future tree ─────────────────────────────────────── */

const goalSchema = z.object({
  title: z.string().trim().min(1).max(220),
  description: z.string().trim().max(3000).optional().nullable(),
  category: z.enum(["love", "career", "home", "travel", "finances", "family", "adventures"]),
  targetDate: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type GoalState = { error?: string };

export async function createGoal(_prev: GoalState, formData: FormData): Promise<GoalState> {
  const { user, relationship } = await requireRelationship();
  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    category: formData.get("category"),
    targetDate: formData.get("targetDate") || null,
    imageUrl: formData.get("imageUrl") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the goal." };
  const store = await getStore();
  await store.createGoal(relationship.id, user.id, parsed.data);
  revalidatePath("/future", "page");
  return {};
}

export async function updateGoalProgress(goalId: string, progress: number) {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  await store.updateGoal(relationship.id, goalId, {
    progress,
    completed: progress >= 100,
  });
  revalidatePath("/future", "page");
  return { success: true };
}

export async function toggleGoalCompleted(goalId: string, completed: boolean) {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  await store.updateGoal(relationship.id, goalId, { completed });
  revalidatePath("/future", "page");
  return { success: true };
}

/* ── Time capsules ───────────────────────────────────────────── */

const capsuleSchema = z.object({
  title: z.string().trim().min(1).max(220),
  note: z.string().trim().max(3000).optional().nullable(),
  unlockAt: z.string().min(1, "Pick an unlock date."),
  mediaIds: z.array(z.string()).max(30).default([]),
  questions: z.array(z.string().trim().max(300)).max(10).default([]),
  predictions: z.array(z.string().trim().max(500)).max(10).default([]),
});

export type CapsuleState = { error?: string };

export async function createTimeCapsule(_prev: CapsuleState, formData: FormData): Promise<CapsuleState> {
  const { relationship } = await requireRelationship();
  const parsed = capsuleSchema.safeParse({
    title: formData.get("title"),
    note: formData.get("note") || null,
    unlockAt: formData.get("unlockAt"),
    mediaIds: splitList(formData.get("mediaIds")),
    questions: splitList(formData.get("questions")),
    predictions: splitList(formData.get("predictions")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the capsule." };
  const store = await getStore();
  await store.createTimeCapsule(relationship.id, {
    ...parsed.data,
    unlockAt: new Date(parsed.data.unlockAt).toISOString(),
  });
  revalidatePath("/time-capsules", "page");
  return {};
}

export async function openTimeCapsule(capsuleId: string) {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  try {
    await store.openTimeCapsule(relationship.id, capsuleId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Not yet." };
  }
  revalidatePath("/time-capsules", "page");
  return { success: true };
}

/* ── Reflections (Us Then / Us Now) ──────────────────────────── */

export async function addReflection(question: string, answer: string) {
  const { user, relationship } = await requireRelationship();
  if (!answer.trim()) return { error: "Write something." };
  const store = await getStore();
  await store.addReflection(relationship.id, user.id, question, answer);
  revalidatePath("/reflections", "page");
  return {};
}

export async function reflectionQuestions() {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  const past = await store.listReflections(relationship.id);
  const answered = new Set(past.map((r) => r.question));
  const unanswered = REFLECTION_QUESTIONS.filter((q) => !answered.has(q));
  return {
    asked: REFLECTION_QUESTIONS.filter((q) => answered.has(q)).slice(0, 3),
    fresh: unanswered[0] ?? REFLECTION_QUESTIONS[0],
  };
}

/* ── Survived ────────────────────────────────────────────────── */

const survivedSchema = z.object({
  whatHappened: z.string().trim().min(1).max(3000),
  howIFelt: z.string().trim().max(3000).optional().nullable(),
  whatILearned: z.string().trim().max(3000).optional().nullable(),
  howWeResolved: z.string().trim().max(3000).optional().nullable(),
  doNotForget: z.string().trim().max(3000).optional().nullable(),
});

export type SurvivedState = { error?: string };

export async function addSurvived(_prev: SurvivedState, formData: FormData): Promise<SurvivedState> {
  const { user, relationship } = await requireRelationship();
  const parsed = survivedSchema.safeParse({
    whatHappened: formData.get("whatHappened"),
    howIFelt: formData.get("howIFelt") || null,
    whatILearned: formData.get("whatILearned") || null,
    howWeResolved: formData.get("howWeResolved") || null,
    doNotForget: formData.get("doNotForget") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the entry." };
  const store = await getStore();
  await store.addSurvived(relationship.id, user.id, {
    whatHappened: parsed.data.whatHappened,
    howIFelt: parsed.data.howIFelt ?? "",
    whatILearned: parsed.data.whatILearned ?? "",
    howWeResolved: parsed.data.howWeResolved ?? "",
    doNotForget: parsed.data.doNotForget ?? "",
    resolved: false,
  });
  revalidatePath("/survived", "page");
  return {};
}

export async function markSurvivedResolved(id: string) {
  const { relationship } = await requireRelationship();
  const store = await getStore();
  await store.markSurvivedResolved(relationship.id, id);
  revalidatePath("/survived", "page");
  return { success: true };
}