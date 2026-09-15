"use server";

import { z } from "zod";
import { getStore } from "@/lib/data/contracts";
import { requireUser } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { computeCounter } from "@/lib/relationship-counter";

const setupSchema = z.object({
  partnerName: z.string().trim().min(2, "Partner's name is required").max(80),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  title: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).optional(),
  coverImageUrl: z.string().optional(),
});

export type SetupState = { error?: string };

export async function createRelationship(_prev: SetupState, formData: FormData): Promise<SetupState> {
  const user = await requireUser();
  if ([...formData.keys()].length === 0) return {};
  if (user.relationshipId) {
    return { error: "You're already part of a relationship." };
  }
  const parsed = setupSchema.safeParse({
    partnerName: formData.get("partnerName"),
    startDate: formData.get("startDate"),
    title: formData.get("title"),
    description: formData.get("description"),
    coverImageUrl: formData.get("coverImageUrl"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the details." };
  }

  const store = await getStore();
  const partnerGivenName = parsed.data.partnerName.split(/\s+/)[0] || "Partner";
  await store.createRelationship({
    ownerId: user.id,
    startDate: new Date(parsed.data.startDate + "T12:00:00.000Z").toISOString(),
    name: `${user.name} × ${partnerGivenName}`,
    title: parsed.data.title || "Universe",
    description: parsed.data.description || "A private universe, just for us.",
    coverImageUrl: parsed.data.coverImageUrl || undefined,
  });
  revalidatePath("/", "page");
  redirect("/home");
}

const updateSchema = z.object({
  partnerName: z.string().trim().min(2).max(80).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  title: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).optional(),
  coverImageUrl: z.string().optional(),
});

export async function updateRelationship(formData: FormData) {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return { error: "No relationship yet." };

  const parsed = updateSchema.safeParse({
    partnerName: formData.get("partnerName"),
    startDate: formData.get("startDate"),
    title: formData.get("title"),
    description: formData.get("description"),
    coverImageUrl: formData.get("coverImageUrl"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const next: Record<string, string> = {};
  if (parsed.data.partnerName) {
    const me = rel.members.find((m) => m.id === user.id);
    const partner = rel.members.find((m) => m.id !== user.id);
    const myFirst = me?.name.split(/\s+/)[0] ?? user.name;
    const theirFirst = partner?.name.split(/\s+/)[0] ?? parsed.data.partnerName;
    next.name = `${myFirst} × ${theirFirst}`;
  }
  if (parsed.data.startDate) next.startDate = new Date(parsed.data.startDate + "T12:00:00.000Z").toISOString();
  if (parsed.data.title !== undefined && parsed.data.title !== "") next.title = parsed.data.title;
  if (parsed.data.description !== undefined) next.description = parsed.data.description;
  if (parsed.data.coverImageUrl !== undefined && parsed.data.coverImageUrl !== "") next.coverImageUrl = parsed.data.coverImageUrl;

  const updated = await store.updateRelationship(rel.id, next);
  revalidatePath("/", "page");
  return { success: true, code: updated?.code };
}

export async function joinRelationship(code: string) {
  const user = await requireUser();
  if (user.relationshipId) {
    redirect("/");
  }
  const store = await getStore();
  try {
    await store.joinRelationship(user.id, code.trim());
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not join that relationship." };
  }
  revalidatePath("/", "page");
  redirect("/home");
}

export async function relationshipSummary() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const memories = await store.listMemories(rel.id);
  const counter = computeCounter(rel.startDate);
  return {
    name: rel.name,
    code: rel.code,
    startDate: rel.startDate,
    counter,
    memoryCount: memories.length,
    coverImageUrl: rel.coverImageUrl,
    members: rel.members.map((m) => ({ id: m.id, name: m.name, avatarUrl: m.avatarUrl })),
  };
}