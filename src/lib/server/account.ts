"use server";

import { z } from "zod";
import { getStore } from "@/lib/data/contracts";
import { createSession, destroySession, hashPassword, requireUser } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { uid } from "@/lib/utils";
import { svgAvatar } from "@/lib/data/demo-art";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.string().trim().email("That email doesn't look right"),
  password: z.string().min(8, "At least 8 characters"),
});

export type SignupState = { error?: string };

export async function signup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  if ([...formData.keys()].length === 0) return {};
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const store = await getStore();
  const existing = await store.findUserByEmail(parsed.data.email);
  if (existing) return { error: "An account with that email already exists." };

  await store.createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: hashPassword(parsed.data.password),
  });
  const user = await store.findUserByEmail(parsed.data.email);
  if (!user) return { error: "Something went wrong. Please try again." };
  await createSession(user.id);
  redirect("/setup");
}

export type LoginState = {
  error?: string;
  code?: string;
  members?: { id: string; name: string; avatarUrl: string | null }[];
};

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (formData.get("reset") === "1") {
    return {};
  }
  // A replay/remount can invoke the action with empty FormData — treat as a fresh visit.
  const codeRaw = formData.get("code");
  if (codeRaw === null) {
    return {};
  }
  const code = typeof codeRaw === "string" ? codeRaw.trim() : "";
  const memberRaw = formData.get("member");
  const member = typeof memberRaw === "string" && memberRaw ? memberRaw : undefined;
  if (!code) {
    return { error: "Enter our secret" };
  }
  const store = await getStore();
  const rel = await store.getRelationshipBySecretCode(code);
  if (!rel) {
    return { error: "That code didn't match. It's the secret you chose together." };
  }
  const members = rel.members.map((m) => ({
    id: m.id,
    name: m.name,
    avatarUrl: m.avatarUrl ?? null,
  }));

  // Step two — pick who's signing in
  if (member) {
    const chosen = members.find((m) => m.id === member);
    if (!chosen) {
      return { error: "That doesn't look like one of us.", code, members };
    }
    await createSession(chosen.id);
    redirect("/home");
  }

  // Step one — code is good, ask who
  return { code, members };
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const store = await getStore();
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (!name) return { error: "Name is required." };
  if (!user.relationshipId) return { error: "No relationship." };

  // Update member display name in the relationship
  const rel = await store.getRelationship(user.relationshipId);
  if (rel) {
    const member = rel.members.find((x) => x.id === user.id);
    if (member) member.name = name;
  }
  user.name = name;

  const avatar = formData.get("avatarUrl");
  if (avatar && typeof avatar === "string") {
    user.avatarUrl = avatar.slice(0, 2000);
  }
  return {};
}

export async function changePassword(formData: FormData) {
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  const { verifyPassword } = await import("@/lib/server/session");
  if (!user.passwordHash || !verifyPassword(current, user.passwordHash)) {
    return { error: "Current password is incorrect." };
  }
  user.passwordHash = hashPassword(next);
  return {};
}

export async function deleteAccount() {
  const user = await requireUser();
  const store = await getStore();
  // In demo mode, vault relationship: keep data but detach. Production would cascade.
  const rel = await store.getRelationshipForUser(user.id);
  if (rel) {
    user.relationshipId = null;
    rel.members = rel.members.filter((m) => m.id !== user.id);
  }
  await destroySession();
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email." };
  const store = await getStore();
  const user = await store.findUserByEmail(email);
  if (!user) return { error: "If that account exists, we've sent a reset link." };
  const { hashPassword: hp, verifyPassword } = await import("@/lib/server/session");
  if (user.relationshipId === "rel_demo") {
    // seeded demo account — restore the documented demo password
    user.passwordHash = "demo-seeded";
  } else {
    // demo mode can't send email; set the documented recovery password
    user.passwordHash = hp("reset1234");
  }
  void verifyPassword;
  return { notice: "Password reset complete. Use the recovery password shown in the app settings." };
}

export async function issueInvitationCode() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  return { code: rel.code, name: rel.name, invitedBy: user.name };
}

export async function getInvitationByCode(code: string) {
  const store = await getStore();
  const rel = await store.getRelationshipByCode(code);
  if (!rel) return null;
  const owner = rel.members.find((m) => m.isOwner);
  return {
    code: rel.code,
    relationshipName: rel.name,
    invitedBy: owner?.name ?? "Alex & Maya",
    relationshipId: rel.id,
  };
}

export async function ensureAvatarForUser(userId: string) {
  const store = await getStore();
  const user = await store.findUserById(userId);
  if (user && !user.avatarUrl) {
    user.avatarUrl = svgAvatar({ seed: user.email || uid("u"), name: user.name });
  }
}