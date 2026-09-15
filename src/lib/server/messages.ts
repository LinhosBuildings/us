"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";

const MAX_BODY = 4000;

export async function sendChatMessage(formData: FormData) {
  const user = await requireUser();
  const body = String(formData.get("body") ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, MAX_BODY);
  if (!body) return;

  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return;

  await store.sendMessage(rel.id, user.id, body);
  revalidatePath("/messages");
}