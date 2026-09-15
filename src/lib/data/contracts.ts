import type {
  Chapter,
  Confession,
  DictionaryEntry,
  FirstRecord,
  FutureGoal,
  Letter,
  LittleThing,
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

export interface CreateMemoryInput {
  title: string;
  kind: Memory["kind"];
  date: string;
  description: string;
  locationName?: string | null;
  mood?: Memory["mood"];
  people: string[];
  tags: string[];
  mediaIds: string[];
  song?: { title: string; artist: string; externalUrl?: string | null } | null;
  visibility: Memory["visibility"];
  neverTold?: string | null;
  constellationX?: number | null;
  constellationY?: number | null;
  chapterId?: string | null;
  milestoneLabel?: string | null;
}

export interface DataStore {
  // ── Users & auth ────────────────────────────────────────────
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(data: { name: string; email: string; passwordHash: string }): Promise<User>;

  // ── Relationships ───────────────────────────────────────────
  getRelationship(id: string): Promise<Relationship | null>;
  getRelationshipByCode(code: string): Promise<Relationship | null>;
  getRelationshipBySecretCode(code: string): Promise<Relationship | null>;
  getRelationshipForUser(userId: string): Promise<Relationship | null>;
  createRelationship(data: {
    ownerId: string;
    startDate: string;
    name: string;
    title?: string | null;
    description?: string | null;
    coverImageUrl?: string | null;
  }): Promise<Relationship>;
  joinRelationship(userId: string, code: string): Promise<Relationship>;
  updateRelationship(id: string, data: Partial<Pick<Relationship, "name" | "title" | "description" | "startDate" | "coverImageUrl">>): Promise<Relationship | null>;

  // ── Memories ────────────────────────────────────────────────
  listMemories(relationshipId: string): Promise<Memory[]>;
  getMemory(relationshipId: string, memoryId: string): Promise<Memory | null>;
  createMemory(relationshipId: string, authorId: string, input: CreateMemoryInput): Promise<Memory>;
  updateMemory(relationshipId: string, memoryId: string, data: Partial<CreateMemoryInput>): Promise<Memory | null>;
  deleteMemory(relationshipId: string, memoryId: string): Promise<void>;
  addMediaToMemory(relationshipId: string, memoryId: string, media: Memory["media"]): Promise<Memory | null>;

  // ── Perspectives ────────────────────────────────────────────
  listPerspectives(relationshipId: string, memoryId: string): Promise<Perspective[]>;
  addPerspective(relationshipId: string, memoryId: string, authorId: string, text: string): Promise<Perspective>;

  // ── Chapters ────────────────────────────────────────────────
  listChapters(relationshipId: string): Promise<Chapter[]>;

  // ── Letters ─────────────────────────────────────────────────
  listLetters(relationshipId: string): Promise<Letter[]>;
  getLetter(relationshipId: string, letterId: string): Promise<Letter | null>;
  createLetter(relationshipId: string, authorId: string, input: { title: string; category: Letter["category"]; body: string; mediaIds: string[]; lockAt?: string | null }): Promise<Letter>;
  deleteLetter(relationshipId: string, letterId: string): Promise<void>;

  // ── Open When ───────────────────────────────────────────────
  listOpenWhen(relationshipId: string): Promise<OpenWhenEntry[]>;
  createOpenWhen(relationshipId: string, authorId: string, input: { title: string; body: string; mediaIds: string[]; lockBehavior: OpenWhenEntry["lockBehavior"]; unlockAt?: string | null; interactionHint?: string | null }): Promise<OpenWhenEntry>;
  unlockOpenWhen(relationshipId: string, entryId: string): Promise<OpenWhenEntry | null>;

  // ── Confessions ─────────────────────────────────────────────
  listConfessions(relationshipId: string): Promise<Confession[]>;
  createConfession(relationshipId: string, authorId: string, input: { text: string; mediaIds: string[]; visibility: Confession["visibility"]; revealAt?: string | null }): Promise<Confession>;
  updateConfession(relationshipId: string, id: string, data: Partial<Omit<Confession, "id" | "relationshipId">>): Promise<Confession | null>;
  deleteConfession(relationshipId: string, id: string): Promise<void>;

  // ── Dictionary ──────────────────────────────────────────────
  listDictionary(relationshipId: string): Promise<DictionaryEntry[]>;
  createDictionaryEntry(relationshipId: string, authorId: string, input: Omit<DictionaryEntry, "id" | "relationshipId" | "authorId" | "createdAt">): Promise<DictionaryEntry>;

  // ── Little things ───────────────────────────────────────────
  listLittleThings(relationshipId: string): Promise<LittleThing[]>;
  createLittleThing(relationshipId: string, authorId: string, input: { what: string; why?: string | null; date?: string | null; mediaIds: string[] }): Promise<LittleThing>;

  // ── Firsts ──────────────────────────────────────────────────
  listFirsts(relationshipId: string): Promise<FirstRecord[]>;
  createFirst(relationshipId: string, authorId: string, input: { title: string; date?: string | null; description?: string | null; imageUrl?: string | null; custom: boolean }): Promise<FirstRecord>;

  // ── Places ──────────────────────────────────────────────────
  listPlaces(relationshipId: string): Promise<Place[]>;
  createPlace(relationshipId: string, input: { name: string; latitude: number; longitude: number; date?: string | null; story?: string | null; memoryIds: string[] }): Promise<Place>;

  // ── Soundtrack ──────────────────────────────────────────────
  listSoundtrack(relationshipId: string): Promise<SoundtrackSong[]>;
  addSoundtrackSong(relationshipId: string, input: { title: string; artist: string; externalUrl?: string | null; memoryTitle?: string | null; why?: string | null; date?: string | null }): Promise<SoundtrackSong>;
  removeSoundtrackSong(relationshipId: string, id: string): Promise<void>;

  // ── Future / goals ──────────────────────────────────────────
  listGoals(relationshipId: string): Promise<FutureGoal[]>;
  createGoal(relationshipId: string, authorId: string, input: { title: string; description?: string | null; category: FutureGoal["category"]; targetDate?: string | null; imageUrl?: string | null }): Promise<FutureGoal>;
  updateGoal(relationshipId: string, goalId: string, data: Partial<Pick<FutureGoal, "progress" | "completed">>): Promise<FutureGoal | null>;

  // ── Time capsules ───────────────────────────────────────────
  listTimeCapsules(relationshipId: string): Promise<TimeCapsule[]>;
  createTimeCapsule(relationshipId: string, input: { title: string; note?: string | null; unlockAt: string; mediaIds: string[]; questions?: string[] | null; predictions?: string[] | null }): Promise<TimeCapsule>;
  openTimeCapsule(relationshipId: string, capsuleId: string): Promise<TimeCapsule | null>;

  // ── Reflections ─────────────────────────────────────────────
  listReflections(relationshipId: string): Promise<Reflection[]>;
  addReflection(relationshipId: string, authorId: string, question: string, answer: string): Promise<Reflection>;

  // ── Survived ────────────────────────────────────────────────
  listSurvived(relationshipId: string): Promise<SurvivedEntry[]>;
  addSurvived(relationshipId: string, authorId: string, input: Omit<SurvivedEntry, "id" | "relationshipId" | "createdAt" | "createdBy">): Promise<SurvivedEntry>;
  markSurvivedResolved(relationshipId: string, id: string): Promise<SurvivedEntry | null>;

  // ── Uploads / media registry ────────────────────────────────
  registerMedia(relationshipId: string, media: Memory["media"][number]): Promise<void>;
}

export const getStore = async (): Promise<DataStore> => {
  const mode = process.env.NEXT_PUBLIC_APP_MODE || "demo";
  if (mode === "prod") {
    try {
      const { prismaStore } = await import("@/lib/data/prisma-store");
      return prismaStore;
    } catch {
      // fall back to demo store if database isn't configured
      const { demoStore } = await import("@/lib/data/demo-store");
      return demoStore;
    }
  }
  const { demoStore } = await import("@/lib/data/demo-store");
  return demoStore;
};