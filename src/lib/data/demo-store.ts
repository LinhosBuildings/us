import type {
  Chapter,
  Confession,
  DictionaryEntry,
  FirstRecord,
  FutureGoal,
  Letter,
  LittleThing,
  MediaAsset,
  Memory,
  OpenWhenEntry,
  Perspective,
  Place,
  Reflection,
  Relationship,
  SoundtrackSong,
  SurvivedEntry,
  TimeCapsule,
  User,
} from "@/lib/types";
import { uid } from "@/lib/utils";
import type { CreateMemoryInput, DataStore } from "@/lib/data/contracts";
import { svgAvatar, svgPhoto } from "@/lib/data/demo-art";
import { LINHO, REL, seedChapters, seedRelationship, seedUsers } from "@/lib/data/demo/seed-core";
import { seedMemories, seedPerspectives } from "@/lib/data/demo/seed-memories";
import { seedConfessions, seedLetters, seedOpenWhen } from "@/lib/data/demo/seed-letters";
import {
  buildSeedCapsules,
  seedDictionary,
  seedFirsts,
  seedGoals,
  seedLittleThings,
  seedPlaces,
  seedReflections,
  seedSoundtrack,
  seedSurvived,
} from "@/lib/data/demo/seed-world";

const allSeedMedia = (): MediaAsset[] => {
  const out: MediaAsset[] = [];
  for (const mem of seedMemories) out.push(...mem.media);
  for (const l of seedLetters) out.push(...l.media);
  for (const ow of seedOpenWhen) out.push(...ow.media);
  for (const c of seedConfessions) out.push(...c.media);
  for (const d of seedDictionary) if (d.audio) out.push(d.audio);
  for (const tc of buildSeedCapsules()) out.push(...tc.media);
  return out;
};

export const demoSeedPasswordHash = () => "demo-seeded";

export class DemoStore implements DataStore {
  users = new Map<string, User>();
  relationships = new Map<string, Relationship>();
  memoriesByRel = new Map<string, Memory[]>();
  perspectives: Perspective[] = [];
  chaptersByRel = new Map<string, Chapter[]>();
  lettersByRel = new Map<string, Letter[]>();
  openWhenByRel = new Map<string, OpenWhenEntry[]>();
  confessionsByRel = new Map<string, Confession[]>();
  dictionaryByRel = new Map<string, DictionaryEntry[]>();
  littleThingsByRel = new Map<string, LittleThing[]>();
  firstsByRel = new Map<string, FirstRecord[]>();
  placesByRel = new Map<string, Place[]>();
  soundtrackByRel = new Map<string, SoundtrackSong[]>();
  goalsByRel = new Map<string, FutureGoal[]>();
  capsulesByRel = new Map<string, TimeCapsule[]>();
  reflectionsByRel = new Map<string, Reflection[]>();
  survivedByRel = new Map<string, SurvivedEntry[]>();
  mediaByRel = new Map<string, MediaAsset[]>();

  constructor() {
    if (this.users.size === 0) this.__seedDemo();
  }

  private __seedDemo() {
    for (const u of seedUsers) this.users.set(u.id, u);
    this.relationships.set(REL, seedRelationship);
    this.chaptersByRel.set(REL, seedChapters);
    this.memoriesByRel.set(REL, seedMemories);
    this.perspectives.push(...seedPerspectives);
    this.lettersByRel.set(REL, seedLetters);
    this.openWhenByRel.set(REL, seedOpenWhen);
    this.confessionsByRel.set(REL, seedConfessions);
    this.dictionaryByRel.set(REL, seedDictionary);
    this.littleThingsByRel.set(REL, seedLittleThings);
    this.firstsByRel.set(REL, seedFirsts);
    this.placesByRel.set(REL, seedPlaces);
    this.soundtrackByRel.set(REL, seedSoundtrack);
    this.goalsByRel.set(REL, seedGoals);
    this.capsulesByRel.set(REL, buildSeedCapsules());
    this.reflectionsByRel.set(REL, seedReflections);
    this.survivedByRel.set(REL, seedSurvived);
    this.mediaByRel.set(REL, allSeedMedia());
  }

  /* ── users ─────────────────────────────────────────────────── */
  async findUserByEmail(email: string) {
    const user = [...this.users.values()].find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ?? null;
  }
  async findUserById(id: string) {
    return this.users.get(id) ?? null;
  }
  async createUser(data: { name: string; email: string; passwordHash: string; whatsapp?: string | null; github?: string | null; instagram?: string | null }) {
    const user: User = {
      id: uid("usr"),
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      avatarUrl: svgAvatar({ seed: data.email, name: data.name }),
      relationshipId: null,
      whatsapp: data.whatsapp ?? null,
      github: data.github ?? null,
      instagram: data.instagram ?? null,
    };
    this.users.set(user.id, user);
    return user;
  }
  async updateUserProfile(userId: string, data: { name?: string; avatarUrl?: string | null; whatsapp?: string | null; github?: string | null; instagram?: string | null }) {
    const user = this.users.get(userId);
    if (!user) return null;
    if (data.name !== undefined && data.name.trim()) user.name = data.name.trim().slice(0, 80);
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    if (data.whatsapp !== undefined) user.whatsapp = data.whatsapp ?? null;
    if (data.github !== undefined) user.github = data.github ?? null;
    if (data.instagram !== undefined) user.instagram = data.instagram ?? null;
    // keep the relationship member view in sync
    if (user.relationshipId) {
      const rel = this.relationships.get(user.relationshipId);
      const member = rel?.members.find((m) => m.id === userId);
      if (member) {
        member.name = user.name;
        member.avatarUrl = user.avatarUrl ?? null;
        member.whatsapp = user.whatsapp;
        member.github = user.github;
        member.instagram = user.instagram;
      }
    }
    return user;
  }

  /* ── relationships ──────────────────────────────────────────── */
  async getRelationship(id: string) {
    return this.relationships.get(id) ?? null;
  }
  async getRelationshipByCode(code: string) {
    const rel = [...this.relationships.values()].find(
      (r) => r.code.toLowerCase() === code.toLowerCase()
    );
    return rel ?? null;
  }
  async getRelationshipBySecretCode(code: string) {
    const rel = [...this.relationships.values()].find(
      (r) => r.secretCode.toLowerCase() === code.toLowerCase()
    );
    return rel ?? null;
  }
  async getRelationshipForUser(userId: string) {
    const user = this.users.get(userId);
    if (!user?.relationshipId) return null;
    return this.relationships.get(user.relationshipId) ?? null;
  }
  async createRelationship(data: {
    ownerId: string;
    startDate: string;
    name: string;
    title?: string | null;
    description?: string | null;
    coverImageUrl?: string | null;
  }) {
    const owner = this.users.get(data.ownerId);
    if (!owner) throw new Error("User not found");
    const code = "US-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const rel: Relationship = {
      id: uid("rel"),
      code,
      secretCode: code,
      name: data.name,
      startDate: data.startDate,
      title: data.title ?? null,
      description: data.description ?? null,
      coverImageUrl:
        data.coverImageUrl ??
        svgPhoto({ seed: data.name, label: "US", title: "our universe", date: "beginning" }),
      members: [
        { id: owner.id, name: owner.name, email: owner.email, avatarUrl: owner.avatarUrl ?? null, isOwner: true },
      ],
      createdAt: new Date().toISOString(),
    };
    this.relationships.set(rel.id, rel);
    this.chaptersByRel.set(rel.id, [
      { id: uid("ch"), relationshipId: rel.id, order: 1, code: "CHAPTER 01", title: "The Beginning", epigraph: "Every great story starts somewhere.", intro: "The first page of your story. Fill it with the day you met." },
      { id: uid("ch"), relationshipId: rel.id, order: 2, code: "CHAPTER 02", title: "We Became Us", epigraph: "And everything changed.", intro: "The moment you stopped being two people and started being a story." },
      { id: uid("ch"), relationshipId: rel.id, order: 3, code: "CHAPTER 03", title: "Where We Are Now", epigraph: "Still us.", intro: "The chapter you're writing right now." },
    ]);
    for (const [k, v] of Object.entries({
      memoriesByRel: [],
      lettersByRel: [],
      openWhenByRel: [],
      confessionsByRel: [],
      dictionaryByRel: [],
      littleThingsByRel: [],
      placesByRel: [],
      soundtrackByRel: [],
      goalsByRel: [],
      capsulesByRel: [],
      reflectionsByRel: [],
      survivedByRel: [],
      mediaByRel: [],
    })) {
      (this as unknown as Record<string, Map<string, unknown[]>>)[k].set(rel.id, v);
    }
    this.firstsByRel.set(rel.id, seedFirsts.map((f) => ({ ...f, id: uid("f"), relationshipId: rel.id })));
    owner.relationshipId = rel.id;
    return rel;
  }
  async joinRelationship(userId: string, code: string) {
    const rel = await this.getRelationshipByCode(code);
    if (!rel) throw new Error("No relationship found for that code.");
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    if (user.relationshipId) throw new Error("You are already part of a relationship.");
    if (!rel.members.some((x) => x.id === userId)) {
      rel.members.push({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl ?? null, isOwner: false });
      user.relationshipId = rel.id;
    }
    return rel;
  }
  async updateRelationship(id: string, data: Partial<Pick<Relationship, "name" | "title" | "description" | "startDate" | "coverImageUrl">>) {
    const rel = this.relationships.get(id);
    if (!rel) return null;
    Object.assign(rel, data);
    return rel;
  }

  /* ── memories ──────────────────────────────────────────────── */
  private sortedMemories(relId: string) {
    return [...(this.memoriesByRel.get(relId) ?? [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  async listMemories(relationshipId: string) {
    return this.sortedMemories(relationshipId);
  }
  async getMemory(relationshipId: string, memoryId: string) {
    return (this.memoriesByRel.get(relationshipId) ?? []).find((x) => x.id === memoryId) ?? null;
  }
  async createMemory(relationshipId: string, authorId: string, input: CreateMemoryInput) {
    const rel = this.relationships.get(relationshipId);
    if (!rel) throw new Error("Relationship not found");
    if (!rel.members.some((m) => m.id === authorId)) throw new Error("Not a member of this relationship");
    const author = this.users.get(authorId);
    const memory: Memory = {
      id: uid("mem"),
      relationshipId,
      title: input.title,
      kind: input.kind,
      date: input.date,
      description: input.description,
      locationName: input.locationName ?? null,
      mood: input.mood ?? null,
      people: input.people ?? [],
      tags: input.tags ?? [],
      media: this.resolveMedia(relationshipId, input.mediaIds),
      song: input.song ?? null,
      visibility: input.visibility,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: authorId,
      createdByName: author?.name ?? "Someone",
      neverTold: input.neverTold ?? null,
      constellationX: input.constellationX ?? 0.2 + Math.random() * 0.6,
      constellationY: input.constellationY ?? 0.2 + Math.random() * 0.5,
      chapterId: input.chapterId ?? null,
      milestone: input.milestoneLabel ? { label: input.milestoneLabel } : null,
      status: input.status ?? "verified",
    };
    const list = this.memoriesByRel.get(relationshipId) ?? [];
    list.push(memory);
    this.memoriesByRel.set(relationshipId, list);
    return memory;
  }
  async updateMemory(relationshipId: string, memoryId: string, data: Partial<CreateMemoryInput>) {
    const memory = await this.getMemory(relationshipId, memoryId);
    if (!memory) return null;
    if (data.title !== undefined) memory.title = data.title;
    if (data.kind !== undefined) memory.kind = data.kind;
    if (data.date !== undefined) memory.date = data.date;
    if (data.description !== undefined) memory.description = data.description;
    if (data.locationName !== undefined) memory.locationName = data.locationName;
    if (data.mood !== undefined) memory.mood = data.mood;
    if (data.people !== undefined) memory.people = data.people;
    if (data.tags !== undefined) memory.tags = data.tags;
    if (data.visibility !== undefined) memory.visibility = data.visibility;
    if (data.neverTold !== undefined) memory.neverTold = data.neverTold;
    if (data.milestoneLabel !== undefined)
      memory.milestone = data.milestoneLabel ? { label: data.milestoneLabel } : null;
    if (data.status !== undefined) memory.status = data.status;
    memory.updatedAt = new Date().toISOString();
    return memory;
  }
  async deleteMemory(relationshipId: string, memoryId: string) {
    const list = this.memoriesByRel.get(relationshipId) ?? [];
    this.memoriesByRel.set(relationshipId, list.filter((x) => x.id !== memoryId));
  }
  async addMediaToMemory(relationshipId: string, memoryId: string, media: Memory["media"]) {
    const memory = await this.getMemory(relationshipId, memoryId);
    if (!memory) return null;
    memory.media = [...memory.media, ...media];
    return memory;
  }
  private resolveMedia(relationshipId: string, mediaIds: string[]) {
    const registry = this.mediaByRel.get(relationshipId) ?? [];
    return mediaIds.map((id) => registry.find((x) => x.id === id)).filter((x): x is MediaAsset => Boolean(x));
  }

  /* ── perspectives ──────────────────────────────────────────── */
  async listPerspectives(relationshipId: string, memoryId: string) {
    return this.perspectives.filter((x) => x.memoryId === memoryId);
  }
  async addPerspective(relationshipId: string, memoryId: string, authorId: string, text: string) {
    const memory = await this.getMemory(relationshipId, memoryId);
    if (!memory) throw new Error("Memory not found");
    const author = this.users.get(authorId);
    const existing = this.perspectives.find((x) => x.memoryId === memoryId && x.authorId === authorId);
    if (existing) {
      existing.text = text;
      return existing;
    }
    const perspective: Perspective = {
      id: uid("per"),
      memoryId,
      authorId,
      authorName: author?.name ?? "Someone",
      text,
      createdAt: new Date().toISOString(),
    };
    this.perspectives.push(perspective);
    return perspective;
  }

  /* ── chapters ──────────────────────────────────────────────── */
  async listChapters(relationshipId: string) {
    return [...(this.chaptersByRel.get(relationshipId) ?? [])].sort((a, b) => a.order - b.order);
  }

  /* ── letters ───────────────────────────────────────────────── */
  async listLetters(relationshipId: string) {
    return [...(this.lettersByRel.get(relationshipId) ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async getLetter(relationshipId: string, letterId: string) {
    return (this.lettersByRel.get(relationshipId) ?? []).find((x) => x.id === letterId) ?? null;
  }
  async createLetter(relationshipId: string, authorId: string, input: { title: string; category: Letter["category"]; body: string; mediaIds: string[]; lockAt?: string | null }) {
    const author = this.users.get(authorId);
    const letter: Letter = {
      id: uid("let"),
      relationshipId,
      authorId,
      authorName: author?.name ?? "Someone",
      title: input.title,
      category: input.category,
      body: input.body,
      media: this.resolveMedia(relationshipId, input.mediaIds),
      lockAt: input.lockAt ?? null,
      createdAt: new Date().toISOString(),
    };
    const list = this.lettersByRel.get(relationshipId) ?? [];
    list.push(letter);
    this.lettersByRel.set(relationshipId, list);
    return letter;
  }
  async deleteLetter(relationshipId: string, letterId: string) {
    const list = this.lettersByRel.get(relationshipId) ?? [];
    this.lettersByRel.set(relationshipId, list.filter((x) => x.id !== letterId));
  }

  /* ── open when ─────────────────────────────────────────────── */
  async listOpenWhen(relationshipId: string) {
    return [...(this.openWhenByRel.get(relationshipId) ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async createOpenWhen(relationshipId: string, authorId: string, input: { title: string; body: string; mediaIds: string[]; lockBehavior: OpenWhenEntry["lockBehavior"]; unlockAt?: string | null; interactionHint?: string | null }) {
    const author = this.users.get(authorId);
    const locked =
      input.lockBehavior === "date"
        ? !input.unlockAt || new Date(input.unlockAt).getTime() > Date.now()
        : input.lockBehavior === "permanent";
    const entry: OpenWhenEntry = {
      id: uid("ow"),
      relationshipId,
      authorId,
      authorName: author?.name ?? "Someone",
      title: input.title,
      body: input.body,
      media: this.resolveMedia(relationshipId, input.mediaIds),
      lockBehavior: input.lockBehavior,
      unlockAt: input.unlockAt ?? null,
      interactionHint: input.interactionHint ?? null,
      locked,
      createdAt: new Date().toISOString(),
    };
    const list = this.openWhenByRel.get(relationshipId) ?? [];
    list.push(entry);
    this.openWhenByRel.set(relationshipId, list);
    return entry;
  }
  async unlockOpenWhen(relationshipId: string, entryId: string) {
    const entry = (this.openWhenByRel.get(relationshipId) ?? []).find((x) => x.id === entryId);
    if (!entry) return null;
    entry.locked = false;
    return entry;
  }

  /* ── confessions ───────────────────────────────────────────── */
  async listConfessions(relationshipId: string) {
    return [...(this.confessionsByRel.get(relationshipId) ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async createConfession(relationshipId: string, authorId: string, input: { text: string; mediaIds: string[]; visibility: Confession["visibility"]; revealAt?: string | null }) {
    const author = this.users.get(authorId);
    const confession: Confession = {
      id: uid("co"),
      relationshipId,
      authorId,
      authorName: author?.name ?? "Someone",
      text: input.text,
      media: this.resolveMedia(relationshipId, input.mediaIds),
      visibility: input.visibility,
      revealAt: input.revealAt ?? null,
      createdAt: new Date().toISOString(),
    };
    const list = this.confessionsByRel.get(relationshipId) ?? [];
    list.push(confession);
    this.confessionsByRel.set(relationshipId, list);
    return confession;
  }
  async updateConfession(relationshipId: string, id: string, data: Partial<Omit<Confession, "id" | "relationshipId">>) {
    const confession = (this.confessionsByRel.get(relationshipId) ?? []).find((x) => x.id === id);
    if (!confession) return null;
    Object.assign(confession, data);
    return confession;
  }
  async deleteConfession(relationshipId: string, id: string) {
    const list = this.confessionsByRel.get(relationshipId) ?? [];
    this.confessionsByRel.set(relationshipId, list.filter((x) => x.id !== id));
  }

  /* ── dictionary ────────────────────────────────────────────── */
  async listDictionary(relationshipId: string) {
    return [...(this.dictionaryByRel.get(relationshipId) ?? [])].sort((a, b) => a.word.localeCompare(b.word));
  }
  async createDictionaryEntry(relationshipId: string, authorId: string, input: Omit<DictionaryEntry, "id" | "relationshipId" | "authorId" | "createdAt">) {
    const entry: DictionaryEntry = {
      ...input,
      id: uid("dic"),
      relationshipId,
      inventorId: input.inventorId ?? authorId,
      createdAt: new Date().toISOString(),
    };
    const list = this.dictionaryByRel.get(relationshipId) ?? [];
    list.push(entry);
    this.dictionaryByRel.set(relationshipId, list);
    return entry;
  }

  /* ── little things ─────────────────────────────────────────── */
  async listLittleThings(relationshipId: string) {
    return [...(this.littleThingsByRel.get(relationshipId) ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async createLittleThing(relationshipId: string, authorId: string, input: { what: string; why?: string | null; date?: string | null; mediaIds: string[] }) {
    const author = this.users.get(authorId);
    const thing: LittleThing = {
      id: uid("lt"),
      relationshipId,
      authorId,
      authorName: author?.name ?? "Someone",
      what: input.what,
      why: input.why ?? null,
      date: input.date ?? null,
      media: this.resolveMedia(relationshipId, input.mediaIds),
      createdAt: new Date().toISOString(),
    };
    const list = this.littleThingsByRel.get(relationshipId) ?? [];
    list.push(thing);
    this.littleThingsByRel.set(relationshipId, list);
    return thing;
  }

  /* ── firsts ────────────────────────────────────────────────── */
  async listFirsts(relationshipId: string) {
    return [...(this.firstsByRel.get(relationshipId) ?? [])].sort(
      (a, b) => new Date(a.date ?? a.createdAt).getTime() - new Date(b.date ?? b.createdAt).getTime()
    );
  }
  async createFirst(relationshipId: string, authorId: string, input: { title: string; date?: string | null; description?: string | null; imageUrl?: string | null; custom: boolean }) {
    const first: FirstRecord = {
      id: uid("f"),
      relationshipId,
      title: input.title,
      date: input.date ?? null,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      custom: input.custom,
      createdAt: new Date().toISOString(),
      createdBy: authorId,
    };
    const list = this.firstsByRel.get(relationshipId) ?? [];
    list.push(first);
    this.firstsByRel.set(relationshipId, list);
    return first;
  }

  /* ── places ────────────────────────────────────────────────── */
  async listPlaces(relationshipId: string) {
    return (this.placesByRel.get(relationshipId) ?? []).slice();
  }
  async createPlace(relationshipId: string, input: { name: string; latitude: number; longitude: number; date?: string | null; story?: string | null; memoryIds: string[] }) {
    const place: Place = {
      id: uid("pl"),
      relationshipId,
      name: input.name,
      latitude: input.latitude,
      longitude: input.longitude,
      date: input.date ?? null,
      story: input.story ?? null,
      memoryIds: input.memoryIds,
      createdAt: new Date().toISOString(),
    };
    const list = this.placesByRel.get(relationshipId) ?? [];
    list.push(place);
    this.placesByRel.set(relationshipId, list);
    return place;
  }

  /* ── soundtrack ────────────────────────────────────────────── */
  async listSoundtrack(relationshipId: string) {
    return [...(this.soundtrackByRel.get(relationshipId) ?? [])].sort(
      (a, b) => new Date(a.date ?? a.createdAt).getTime() - new Date(b.date ?? b.createdAt).getTime()
    );
  }
  async addSoundtrackSong(relationshipId: string, input: { title: string; artist: string; externalUrl?: string | null; memoryTitle?: string | null; why?: string | null; date?: string | null }) {
    const song: SoundtrackSong = {
      id: uid("st"),
      relationshipId,
      song: { id: uid("song"), title: input.title, artist: input.artist, externalUrl: input.externalUrl ?? null },
      memoryTitle: input.memoryTitle ?? null,
      why: input.why ?? null,
      date: input.date ?? null,
      createdAt: new Date().toISOString(),
    };
    const list = this.soundtrackByRel.get(relationshipId) ?? [];
    list.push(song);
    this.soundtrackByRel.set(relationshipId, list);
    return song;
  }
  async removeSoundtrackSong(relationshipId: string, id: string) {
    const list = this.soundtrackByRel.get(relationshipId) ?? [];
    this.soundtrackByRel.set(relationshipId, list.filter((x) => x.id !== id));
  }

  /* ── goals ─────────────────────────────────────────────────── */
  async listGoals(relationshipId: string) {
    return [...(this.goalsByRel.get(relationshipId) ?? [])].sort(
      (a, b) => Number(a.completed) - Number(b.completed) || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
  async createGoal(relationshipId: string, authorId: string, input: { title: string; description?: string | null; category: FutureGoal["category"]; targetDate?: string | null; imageUrl?: string | null }) {
    const author = this.users.get(authorId);
    const goal: FutureGoal = {
      id: uid("g"),
      relationshipId,
      title: input.title,
      description: input.description ?? null,
      category: input.category,
      targetDate: input.targetDate ?? null,
      progress: 0,
      imageUrl: input.imageUrl ?? null,
      createdBy: authorId,
      createdByName: author?.name ?? "Someone",
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const list = this.goalsByRel.get(relationshipId) ?? [];
    list.push(goal);
    this.goalsByRel.set(relationshipId, list);
    return goal;
  }
  async updateGoal(relationshipId: string, goalId: string, data: Partial<Pick<FutureGoal, "progress" | "completed">>) {
    const goal = (this.goalsByRel.get(relationshipId) ?? []).find((x) => x.id === goalId);
    if (!goal) return null;
    if (data.progress !== undefined) goal.progress = Math.min(100, Math.max(0, data.progress));
    if (data.completed !== undefined) {
      goal.completed = data.completed;
      if (data.completed) goal.progress = 100;
    }
    return goal;
  }

  /* ── time capsules ─────────────────────────────────────────── */
  async listTimeCapsules(relationshipId: string) {
    return (this.capsulesByRel.get(relationshipId) ?? []).slice();
  }
  async createTimeCapsule(relationshipId: string, input: { title: string; note?: string | null; unlockAt: string; mediaIds: string[]; questions?: string[] | null; predictions?: string[] | null }) {
    const capsule: TimeCapsule = {
      id: uid("tc"),
      relationshipId,
      title: input.title,
      note: input.note ?? null,
      createdAt: new Date().toISOString(),
      unlockAt: input.unlockAt,
      media: this.resolveMedia(relationshipId, input.mediaIds),
      questions: input.questions ?? null,
      predictions: input.predictions ?? null,
      status: "sealed",
      openedAt: null,
    };
    const list = this.capsulesByRel.get(relationshipId) ?? [];
    list.push(capsule);
    this.capsulesByRel.set(relationshipId, list);
    return capsule;
  }
  async openTimeCapsule(relationshipId: string, capsuleId: string) {
    const capsule = (this.capsulesByRel.get(relationshipId) ?? []).find((x) => x.id === capsuleId);
    if (!capsule) return null;
    if (capsule.status === "sealed" && new Date(capsule.unlockAt).getTime() > Date.now()) {
      throw new Error("This capsule is still sealed.");
    }
    capsule.status = "unlocked";
    capsule.openedAt = new Date().toISOString();
    return capsule;
  }

  /* ── reflections ───────────────────────────────────────────── */
  async listReflections(relationshipId: string) {
    return [...(this.reflectionsByRel.get(relationshipId) ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async addReflection(relationshipId: string, authorId: string, question: string, answer: string) {
    const author = this.users.get(authorId);
    const reflection: Reflection = {
      id: uid("rf"),
      relationshipId,
      question,
      answer,
      authorId,
      authorName: author?.name ?? "Someone",
      createdAt: new Date().toISOString(),
    };
    const list = this.reflectionsByRel.get(relationshipId) ?? [];
    list.push(reflection);
    this.reflectionsByRel.set(relationshipId, list);
    return reflection;
  }

  /* ── survived ──────────────────────────────────────────────── */
  async listSurvived(relationshipId: string) {
    return [...(this.survivedByRel.get(relationshipId) ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async addSurvived(relationshipId: string, authorId: string, input: Omit<SurvivedEntry, "id" | "relationshipId" | "createdAt" | "createdBy">) {
    const entry: SurvivedEntry = {
      ...input,
      id: uid("su"),
      relationshipId,
      createdAt: new Date().toISOString(),
      createdBy: authorId,
      resolved: false,
    };
    const list = this.survivedByRel.get(relationshipId) ?? [];
    list.push(entry);
    this.survivedByRel.set(relationshipId, list);
    return entry;
  }
  async markSurvivedResolved(relationshipId: string, id: string) {
    const entry = (this.survivedByRel.get(relationshipId) ?? []).find((x) => x.id === id);
    if (!entry) return null;
    entry.resolved = true;
    return entry;
  }

  /* ── media registry ────────────────────────────────────────── */
  async registerMedia(relationshipId: string, media: MediaAsset) {
    const list = this.mediaByRel.get(relationshipId) ?? [];
    list.push(media);
    this.mediaByRel.set(relationshipId, list);
  }

  /* helper used by auth to validate demo users */
  getDemoUsers() {
    return [...this.users.values()];
  }
}

export const demoStore = new DemoStore();
void LINHO;