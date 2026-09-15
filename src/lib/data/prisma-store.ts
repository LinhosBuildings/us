// @ts-nocheck
// Production DataStore backed by Prisma + PostgreSQL (Supabase).
// Enable with NEXT_PUBLIC_APP_MODE=prod and DATABASE_URL set.
// The PrismaClient is created lazily so demo mode never needs a database.
// Schema lives in prisma/schema.prisma.

import type { DataStore, CreateMemoryInput } from "@/lib/data/contracts";
import {
  MemoryVisibility,
  Relationship,
  RelationshipMemberView,
  User,
} from "@/lib/types";
import { uid } from "@/lib/utils";

type Db = any;

function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

class PrismaStore implements DataStore {
  private prisma: Db | null = null;

  private get db(): Db {
    if (this.prisma) return this.prisma;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    this.prisma = new PrismaClient();
    return this.prisma;
  }

  // ── Users ───────────────────────────────────────────────────

  async findUserByEmail(email: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { email } });
    return row ? this.mapUser(row) : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? this.mapUser(row) : null;
  }

  async createUser(data: { name: string; email: string; passwordHash: string }): Promise<User> {
    const row = await this.db.user.create({ data });
    return this.mapUser(row);
  }

  private mapUser(row: Db): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      avatarUrl: row.avatarUrl,
      relationshipId: row.relationshipId,
    };
  }

  private async mapRelationship(row: Db): Promise<Relationship> {
    const members = await this.db.relationshipMember.findMany({
      where: { relationshipId: row.id },
      include: { user: true },
    });
    return {
      id: row.id,
      code: row.code,
      secretCode: row.secretCode,
      name: row.name,
      startDate: row.startDate.toISOString(),
      title: row.title,
      description: row.description,
      coverImageUrl: row.coverImageUrl,
      createdAt: row.createdAt.toISOString(),
      members: members.map((m: Db): RelationshipMemberView => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        isOwner: m.isOwner,
      })),
    };
  }

  // ── Relationships ───────────────────────────────────────────

  async getRelationship(id: string): Promise<Relationship | null> {
    const row = await this.db.relationship.findUnique({ where: { id } });
    return row ? this.mapRelationship(row) : null;
  }

  async getRelationshipByCode(code: string): Promise<Relationship | null> {
    const row = await this.db.relationship.findUnique({ where: { code: code.toUpperCase() } });
    return row ? this.mapRelationship(row) : null;
  }

  async getRelationshipBySecretCode(code: string): Promise<Relationship | null> {
    const row = await this.db.relationship.findFirst({ where: { secretCode: code.trim().toUpperCase() } });
    return row ? this.mapRelationship(row) : null;
  }

  async getRelationshipForUser(userId: string): Promise<Relationship | null> {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user?.relationshipId) return null;
    const row = await this.db.relationship.findUnique({ where: { id: user.relationshipId } });
    return row ? this.mapRelationship(row) : null;
  }

  async createRelationship(data: {
    ownerId: string;
    startDate: string;
    name: string;
    title?: string | null;
    description?: string | null;
    coverImageUrl?: string | null;
  }): Promise<Relationship> {
const code = this.generateCode();
    const row = await this.db.$transaction(async (tx: Db) => {
      const relationship = await tx.relationship.create({
        data: {
          code,
          secretCode: code,
          name: data.name,
          startDate: new Date(data.startDate),
          title: data.title ?? null,
          description: data.description ?? null,
          coverImageUrl: data.coverImageUrl ?? null,
        },
      });
      await tx.relationshipMember.create({
        data: { relationshipId: relationship.id, userId: data.ownerId, isOwner: true },
      });
      await tx.user.update({
        where: { id: data.ownerId },
        data: { relationshipId: relationship.id },
      });
      return relationship;
    });
    return this.mapRelationship(row);
  }

  async joinRelationship(userId: string, code: string): Promise<Relationship> {
    const row = await this.db.relationship.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (!row) throw new Error("That code doesn't open any universe.");
    const existing = await this.db.relationshipMember.findUnique({
      where: { relationshipId_userId: { relationshipId: row.id, userId } },
    });
    if (existing) throw new Error("You're already part of that universe.");
    const count = await this.db.relationshipMember.count({ where: { relationshipId: row.id } });
    if (count >= 2) throw new Error("A universe is built for two. This one is already complete.");
    await this.db.$transaction([
      this.db.relationshipMember.create({ data: { relationshipId: row.id, userId, isOwner: false } }),
      this.db.user.update({ where: { id: userId }, data: { relationshipId: row.id } }),
    ]);
    return this.mapRelationship(row);
  }

  async updateRelationship(
    id: string,
    data: Partial<Pick<Relationship, "name" | "title" | "description" | "startDate" | "coverImageUrl">>
  ): Promise<Relationship> {
    const row = await this.db.relationship.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.coverImageUrl !== undefined ? { coverImageUrl: data.coverImageUrl } : {}),
      },
    });
    return this.mapRelationship(row);
  }

  private generateCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 6; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  // ── Memories ────────────────────────────────────────────────

  async listMemories(relationshipId: string): Promise<Memory[]> {
    const rows = await this.db.memory.findMany({
      where: { relationshipId },
      orderBy: { date: "desc" },
      include: { media: { include: { media: true } }, perspectives: true, author: true },
    });
    return rows.map((r: Db) => this.mapMemory(r));
  }

  async getMemory(relationshipId: string, memoryId: string): Promise<Memory | null> {
    const row = await this.db.memory.findFirst({
      where: { id: memoryId, relationshipId },
      include: { media: { include: { media: true } }, perspectives: true, author: true },
    });
    return row ? this.mapMemory(row) : null;
  }

  private mapMemory(row: Db): Memory {
    return {
      id: row.id,
      relationshipId: row.relationshipId,
      title: row.title,
      kind: row.kind,
      date: row.date.toISOString(),
      description: row.description ?? "",
      locationName: row.locationName,
      mood: row.mood,
      people: row.people ?? [],
      tags: row.tags ?? [],
      media: (row.media ?? []).map((jm: Db) => this.mapMedia(jm.media)),
      song: row.songTitle && row.songArtist
        ? { title: row.songTitle, artist: row.songArtist, externalUrl: row.songExternalUrl }
        : null,
      visibility: row.visibility,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      createdBy: row.createdBy,
      createdByName: row.author?.name ?? "Someone",
      constellationX: row.constellationX,
      constellationY: row.constellationY,
      chapterId: row.chapterId,
      neverTold: row.neverTold,
      milestone: row.milestoneLabel ? { label: row.milestoneLabel, category: row.milestoneCategory } : null,
    };
  }

  private mapMedia(row: Db) {
    return {
      id: row.id,
      type: row.type,
      url: row.url,
      thumbnailUrl: row.thumbnailUrl,
      width: row.width,
      height: row.height,
      durationMs: row.durationMs,
      mime: row.mime,
      sizeBytes: row.sizeBytes,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async createMemory(relationshipId: string, authorId: string, input: CreateMemoryInput): Promise<Memory> {
    const author = await this.db.user.findUnique({ where: { id: authorId } });
    const row = await this.db.memory.create({
      data: {
        relationshipId,
        title: input.title,
        kind: input.kind,
        date: new Date(input.date),
        description: input.description ?? "",
        locationName: input.locationName,
        mood: input.mood,
        people: input.people ?? [],
        tags: input.tags ?? [],
        visibility: input.visibility,
        neverTold: input.neverTold,
        constellationX: input.constellationX,
        constellationY: input.constellationY,
        chapterId: input.chapterId,
        milestoneLabel: input.milestoneLabel,
        songTitle: input.song?.title,
        songArtist: input.song?.artist,
        songExternalUrl: input.song?.externalUrl,
        createdBy: authorId,
      },
    });
    if (input.mediaIds?.length) {
      for (const mediaId of input.mediaIds) {
        await this.db.memoryMedia.create({ data: { memoryId: row.id, mediaId } });
      }
    }
    const full = await this.db.memory.findUnique({
      where: { id: row.id },
      include: { media: { include: { media: true } }, perspectives: true, author: true },
    });
    return this.mapMemory(full);
  }

  async updateMemory(
    relationshipId: string,
    memoryId: string,
    data: Partial<CreateMemoryInput>
  ): Promise<Memory | null> {
    const exists = await this.db.memory.findFirst({ where: { id: memoryId, relationshipId } });
    if (!exists) return null;
    const row = await this.db.memory.update({
      where: { id: memoryId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.date !== undefined ? { date: new Date(data.date) } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.locationName !== undefined ? { locationName: data.locationName } : {}),
        ...(data.mood !== undefined ? { mood: data.mood } : {}),
        ...(data.people !== undefined ? { people: data.people } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.visibility !== undefined ? { visibility: data.visibility } : {}),
        ...(data.neverTold !== undefined ? { neverTold: data.neverTold } : {}),
        ...(data.chapterId !== undefined ? { chapterId: data.chapterId } : {}),
      },
    });
    const full = await this.db.memory.findUnique({
      where: { id: row.id },
      include: { media: { include: { media: true } }, perspectives: true, author: true },
    });
    return this.mapMemory(full);
  }

  async deleteMemory(relationshipId: string, memoryId: string): Promise<void> {
    await this.db.memory.deleteMany({ where: { id: memoryId, relationshipId } });
  }

  async addMediaToMemory(relationshipId: string, memoryId: string, media: Memory["media"]): Promise<Memory | null> {
    for (const m of media) {
      await this.db.media.create({ data: { ...m } });
      await this.db.memoryMedia.create({ data: { memoryId, mediaId: m.id } });
    }
    return this.getMemory(relationshipId, memoryId);
  }

  // ── Perspectives ────────────────────────────────────────────

  async listPerspectives(relationshipId: string, memoryId: string): Promise<Perspective[]> {
    const rows = await this.db.perspective.findMany({ where: { memoryId } });
    return rows.map((r: Db) => ({
      id: r.id,
      memoryId: r.memoryId,
      authorId: r.authorId,
      authorName: r.authorName,
      text: r.text,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async addPerspective(relationshipId: string, memoryId: string, authorId: string, text: string): Promise<Perspective> {
    const author = await this.db.user.findUnique({ where: { id: authorId } });
    const row = await this.db.perspective.create({
      data: { memoryId, authorId, authorName: author?.name ?? "Someone", text },
    });
    return {
      id: row.id,
      memoryId,
      authorId,
      authorName: author?.name ?? "Someone",
      text,
      createdAt: row.createdAt.toISOString(),
    };
  }

  // ── Chapters ────────────────────────────────────────────────

  async listChapters(relationshipId: string): Promise<Chapter[]> {
    const rows = await this.db.chapter.findMany({
      where: { relationshipId },
      orderBy: { order: "asc" },
    });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      order: r.order,
      code: r.code,
      title: r.title,
      epigraph: r.epigraph,
      intro: r.intro,
    }));
  }

  // ── Letters ─────────────────────────────────────────────────

  async listLetters(relationshipId: string): Promise<Letter[]> {
    const rows = await this.db.letter.findMany({
      where: { relationshipId },
      orderBy: { createdAt: "desc" },
      include: { media: { include: { media: true } }, author: true },
    });
    return rows.map((r: Db) => this.mapLetter(r));
  }

  async getLetter(relationshipId: string, letterId: string): Promise<Letter | null> {
    const row = await this.db.letter.findFirst({
      where: { id: letterId, relationshipId },
      include: { media: { include: { media: true } }, author: true },
    });
    return row ? this.mapLetter(row) : null;
  }

  private mapLetter(row: Db): Letter {
    return {
      id: row.id,
      relationshipId: row.relationshipId,
      authorId: row.authorId,
      authorName: row.author?.name ?? "Someone",
      title: row.title,
      category: row.category,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
      lockAt: row.lockAt?.toISOString(),
      media: (row.media ?? []).map((jm: Db) => this.mapMedia(jm.media)),
    };
  }

  async createLetter(
    relationshipId: string,
    authorId: string,
    input: { title: string; category: string; body: string; mediaIds: string[]; lockAt?: string | null }
  ): Promise<Letter> {
    const row = await this.db.letter.create({
      data: {
        relationshipId,
        authorId,
        title: input.title,
        category: input.category,
        body: input.body,
        lockAt: input.lockAt ? new Date(input.lockAt) : null,
      },
    });
    for (const mediaId of input.mediaIds) {
      await this.db.letterMedia.create({ data: { letterId: row.id, mediaId } });
    }
    const letter = await this.getLetter(relationshipId, row.id);
    return letter!;
  }

  async deleteLetter(relationshipId: string, letterId: string): Promise<void> {
    await this.db.letter.deleteMany({ where: { id: letterId, relationshipId } });
  }

  // ── Open When ───────────────────────────────────────────────

  async listOpenWhen(relationshipId: string): Promise<OpenWhenEntry[]> {
    const rows = await this.db.openWhen.findMany({
      where: { relationshipId },
      orderBy: { createdAt: "desc" },
      include: { media: { include: { media: true } }, author: true },
    });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      authorId: r.authorId,
      authorName: r.author?.name ?? "Someone",
      title: r.title,
      body: r.body,
      media: (r.media ?? []).map((jm: Db) => this.mapMedia(jm.media)),
      lockBehavior: r.lockBehavior,
      unlockAt: r.unlockAt?.toISOString() ?? null,
      interactionHint: r.interactionHint,
      locked: r.locked,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async createOpenWhen(
    relationshipId: string,
    authorId: string,
    input: { title: string; body: string; mediaIds: string[]; lockBehavior: string; unlockAt?: string | null; interactionHint?: string | null }
  ): Promise<OpenWhenEntry> {
    const row = await this.db.openWhen.create({
      data: {
        relationshipId,
        authorId,
        title: input.title,
        body: input.body,
        lockBehavior: input.lockBehavior,
        unlockAt: input.unlockAt ? new Date(input.unlockAt) : null,
        interactionHint: input.interactionHint,
        locked: input.lockBehavior !== "immediate",
      },
    });
    for (const mediaId of input.mediaIds) {
      await this.db.openWhenMedia.create({ data: { entryId: row.id, mediaId } });
    }
    const list = await this.listOpenWhen(relationshipId);
    return list.find((e) => e.id === row.id)!;
  }

  async unlockOpenWhen(relationshipId: string, entryId: string): Promise<OpenWhenEntry | null> {
    const row = await this.db.openWhen.updateMany({
      where: { id: entryId, relationshipId },
      data: { locked: false },
    });
    if (row.count === 0) return null;
    const list = await this.listOpenWhen(relationshipId);
    return list.find((e) => e.id === entryId) ?? null;
  }

  // ── Confessions ─────────────────────────────────────────────

  async listConfessions(relationshipId: string): Promise<Confession[]> {
    const rows = await this.db.confession.findMany({
      where: { relationshipId },
      orderBy: { createdAt: "desc" },
      include: { media: { include: { media: true } }, author: true },
    });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      authorId: r.authorId,
      authorName: r.author?.name ?? "Someone",
      text: r.text,
      media: (r.media ?? []).map((jm: Db) => this.mapMedia(jm.media)),
      visibility: r.visibility,
      revealAt: r.revealAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async createConfession(
    relationshipId: string,
    authorId: string,
    input: { text: string; mediaIds: string[]; visibility: string; revealAt?: string | null }
  ): Promise<Confession> {
    const author = await this.db.user.findUnique({ where: { id: authorId } });
    const row = await this.db.confession.create({
      data: { relationshipId, authorId, text: input.text, visibility: input.visibility, revealAt: input.revealAt ? new Date(input.revealAt) : null },
    });
    for (const mediaId of input.mediaIds) {
      await this.db.confessionMedia.create({ data: { confessionId: row.id, mediaId } });
    }
    return this.listConfessions(relationshipId).then((l) => l.find((c) => c.id === row.id)!);
  }

  async updateConfession(relationshipId: string, id: string, data: Partial<Omit<Confession, "id" | "relationshipId">>): Promise<Confession | null> {
    const row = await this.db.confession.updateMany({
      where: { id, relationshipId },
      data: {
        ...(data.text !== undefined ? { text: data.text } : {}),
        ...(data.visibility !== undefined ? { visibility: data.visibility } : {}),
        ...(data.revealAt !== undefined ? { revealAt: data.revealAt ? new Date(data.revealAt) : null } : {}),
      },
    });
    if (row.count === 0) return null;
    const list = await this.listConfessions(relationshipId);
    return list.find((c) => c.id === id) ?? null;
  }

  async deleteConfession(relationshipId: string, id: string): Promise<void> {
    await this.db.confession.deleteMany({ where: { id, relationshipId } });
  }

  // ── Dictionary ──────────────────────────────────────────────

  async listDictionary(relationshipId: string): Promise<DictionaryEntry[]> {
    const rows = await this.db.dictionaryEntry.findMany({ where: { relationshipId }, orderBy: { word: "asc" } });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      word: r.word,
      meaning: r.meaning,
      inventorId: r.inventorId,
      inventorName: r.inventorName,
      origin: r.origin,
      example: r.example,
      usedSince: r.usedSince,
      audio: r.audioId ? null : null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async createDictionaryEntry(relationshipId: string, authorId: string, input: Partial<DictionaryEntry>): Promise<DictionaryEntry> {
    const author = await this.db.user.findUnique({ where: { id: authorId } });
    const row = await this.db.dictionaryEntry.create({
      data: {
        relationshipId,
        word: input.word!.toUpperCase(),
        meaning: input.meaning!,
        inventorId: authorId,
        inventorName: input.inventorName ?? author?.name ?? null,
        origin: input.origin,
        example: input.example,
        usedSince: input.usedSince,
      },
    });
    return this.listDictionary(relationshipId).then((l) => l.find((d) => d.id === row.id)!);
  }

  // ── Little things ───────────────────────────────────────────

  async listLittleThings(relationshipId: string): Promise<LittleThing[]> {
    const rows = await this.db.littleThing.findMany({ where: { relationshipId }, orderBy: { createdAt: "desc" }, include: { author: true, media: { include: { media: true } } } });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      authorId: r.authorId,
      authorName: r.author?.name ?? "Someone",
      what: r.what,
      why: r.why,
      date: r.date?.toISOString() ?? null,
      media: (r.media ?? []).map((jm: Db) => this.mapMedia(jm.media)),
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async createLittleThing(relationshipId: string, authorId: string, input: { what: string; why?: string | null; date?: string | null; mediaIds: string[] }): Promise<LittleThing> {
    const row = await this.db.littleThing.create({
      data: { relationshipId, authorId, what: input.what, why: input.why, date: input.date ? new Date(input.date) : null },
    });
    for (const mediaId of input.mediaIds) {
      await this.db.littleThingMedia.create({ data: { thingId: row.id, mediaId } });
    }
    return this.listLittleThings(relationshipId).then((l) => l.find((t) => t.id === row.id)!);
  }

  // ── Firsts ──────────────────────────────────────────────────

  async listFirsts(relationshipId: string): Promise<FirstRecord[]> {
    const rows = await this.db.firstRecord.findMany({ where: { relationshipId }, orderBy: { date: "asc" } });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      title: r.title,
      date: r.date?.toISOString() ?? null,
      description: r.description,
      imageUrl: r.imageUrl,
      custom: true,
      createdAt: r.createdAt.toISOString(),
      createdBy: r.createdBy,
    }));
  }

  async createFirst(relationshipId: string, authorId: string, input: { title: string; date?: string | null; description?: string | null; imageUrl?: string | null; custom: boolean }): Promise<FirstRecord> {
    const row = await this.db.firstRecord.create({
      data: { relationshipId, title: input.title, date: input.date ? new Date(input.date) : null, description: input.description, imageUrl: input.imageUrl, createdBy: authorId },
    });
    return { id: row.id, relationshipId, title: row.title, date: row.date?.toISOString() ?? null, description: row.description, imageUrl: row.imageUrl, custom: true, createdAt: row.createdAt.toISOString(), createdBy: authorId };
  }

  // ── Places ──────────────────────────────────────────────────

  async listPlaces(relationshipId: string): Promise<Place[]> {
    const rows = await this.db.place.findMany({ where: { relationshipId }, orderBy: { createdAt: "desc" } });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      date: r.date?.toISOString() ?? null,
      story: r.story,
      memoryIds: r.memoryIds ?? [],
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async createPlace(relationshipId: string, input: { name: string; latitude: number; longitude: number; date?: string | null; story?: string | null; memoryIds: string[] }): Promise<Place> {
    const row = await this.db.place.create({
      data: { relationshipId, name: input.name, latitude: input.latitude, longitude: input.longitude, date: input.date ? new Date(input.date) : null, story: input.story, memoryIds: input.memoryIds },
    });
    return this.listPlaces(relationshipId).then((l) => l.find((p) => p.id === row.id)!);
  }

  // ── Soundtrack ──────────────────────────────────────────────

  async listSoundtrack(relationshipId: string): Promise<SoundtrackSong[]> {
    const rows = await this.db.soundtrackSong.findMany({ where: { relationshipId }, orderBy: { createdAt: "desc" } });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      song: { id: r.id, title: r.title, artist: r.artist, externalUrl: r.externalUrl },
      memoryTitle: r.memoryTitle,
      why: r.why,
      date: r.date?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async addSoundtrackSong(relationshipId: string, input: { title: string; artist: string; externalUrl?: string | null; memoryTitle?: string | null; why?: string | null; date?: string | null }): Promise<SoundtrackSong> {
    const row = await this.db.soundtrackSong.create({
      data: { relationshipId, title: input.title, artist: input.artist, externalUrl: input.externalUrl, memoryTitle: input.memoryTitle, why: input.why, date: input.date ? new Date(input.date) : null },
    });
    return this.listSoundtrack(relationshipId).then((l) => l.find((s) => s.id === row.id)!);
  }

  async removeSoundtrackSong(relationshipId: string, id: string): Promise<void> {
    await this.db.soundtrackSong.deleteMany({ where: { id, relationshipId } });
  }

  // ── Goals ───────────────────────────────────────────────────

  async listGoals(relationshipId: string): Promise<FutureGoal[]> {
    const rows = await this.db.futureGoal.findMany({ where: { relationshipId }, orderBy: { createdAt: "desc" }, include: { author: true } });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      title: r.title,
      description: r.description,
      category: r.category,
      targetDate: r.targetDate?.toISOString() ?? null,
      progress: r.progress,
      imageUrl: r.imageUrl,
      createdBy: r.createdBy,
      createdByName: r.author?.name ?? "Someone",
      completed: r.completed,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async createGoal(relationshipId: string, authorId: string, input: { title: string; description?: string | null; category: string; targetDate?: string | null; imageUrl?: string | null }): Promise<FutureGoal> {
    const row = await this.db.futureGoal.create({
      data: { relationshipId, title: input.title, description: input.description, category: input.category, targetDate: input.targetDate ? new Date(input.targetDate) : null, imageUrl: input.imageUrl, createdBy: authorId },
    });
    return this.listGoals(relationshipId).then((l) => l.find((g) => g.id === row.id)!);
  }

  async updateGoal(relationshipId: string, goalId: string, data: Partial<Pick<FutureGoal, "progress" | "completed">>): Promise<FutureGoal | null> {
    const row = await this.db.futureGoal.updateMany({ where: { id: goalId, relationshipId }, data });
    if (row.count === 0) return null;
    return this.listGoals(relationshipId).then((l) => l.find((g) => g.id === goalId) ?? null);
  }

  // ── Time capsules ───────────────────────────────────────────

  async listTimeCapsules(relationshipId: string): Promise<TimeCapsule[]> {
    const rows = await this.db.timeCapsule.findMany({ where: { relationshipId }, orderBy: { unlockAt: "asc" }, include: { media: { include: { media: true } } } });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      title: r.title,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
      unlockAt: r.unlockAt.toISOString(),
      media: (r.media ?? []).map((jm: Db) => this.mapMedia(jm.media)),
      questions: r.questions ?? [],
      predictions: r.predictions ?? [],
      status: r.status,
      openedAt: r.openedAt?.toISOString() ?? null,
    }));
  }

  async createTimeCapsule(relationshipId: string, input: { title: string; note?: string | null; unlockAt: string; mediaIds: string[]; questions?: string[] | null; predictions?: string[] | null }): Promise<TimeCapsule> {
    const row = await this.db.timeCapsule.create({
      data: { relationshipId, title: input.title, note: input.note, unlockAt: new Date(input.unlockAt), questions: input.questions ?? [], predictions: input.predictions ?? [] },
    });
    for (const mediaId of input.mediaIds) {
      await this.db.timeCapsuleMedia.create({ data: { capsuleId: row.id, mediaId } });
    }
    return this.listTimeCapsules(relationshipId).then((l) => l.find((c) => c.id === row.id)!);
  }

  async openTimeCapsule(relationshipId: string, capsuleId: string): Promise<TimeCapsule | null> {
    const existing = await this.db.timeCapsule.findFirst({ where: { id: capsuleId, relationshipId } });
    if (!existing) return null;
    if (existing.status === "sealed" && new Date(existing.unlockAt).getTime() > Date.now()) {
      throw new Error("Not yet. The date hasn't come.");
    }
    const now = new Date();
    const row = await this.db.timeCapsule.update({ where: { id: capsuleId }, data: { status: "unlocked", openedAt: now } });
    return this.listTimeCapsules(relationshipId).then((l) => l.find((c) => c.id === row.id)!);
  }

  // ── Reflections ─────────────────────────────────────────────

  async listReflections(relationshipId: string): Promise<Reflection[]> {
    const rows = await this.db.reflection.findMany({ where: { relationshipId }, orderBy: { createdAt: "desc" }, include: { author: true } });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      question: r.question,
      answer: r.answer,
      authorId: r.authorId,
      authorName: r.author?.name ?? "Someone",
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async addReflection(relationshipId: string, authorId: string, question: string, answer: string): Promise<Reflection> {
    const author = await this.db.user.findUnique({ where: { id: authorId } });
    const row = await this.db.reflection.create({
      data: { relationshipId, question, answer, authorId, authorName: author?.name ?? "Someone" },
    });
    return { id: row.id, relationshipId, question, answer, authorId, authorName: author?.name ?? "Someone", createdAt: row.createdAt.toISOString() };
  }

  // ── Survived ────────────────────────────────────────────────

  async listSurvived(relationshipId: string): Promise<SurvivedEntry[]> {
    const rows = await this.db.survivedEntry.findMany({ where: { relationshipId }, orderBy: { createdAt: "desc" } });
    return rows.map((r: Db) => ({
      id: r.id,
      relationshipId: r.relationshipId,
      whatHappened: r.whatHappened,
      howIFelt: r.howIFelt ?? "",
      whatILearned: r.whatILearned ?? "",
      howWeResolved: r.howWeResolved ?? "",
      doNotForget: r.doNotForget ?? "",
      resolved: r.resolved,
      createdAt: r.createdAt.toISOString(),
      createdBy: r.createdBy,
    }));
  }

  async addSurvived(relationshipId: string, authorId: string, input: Partial<SurvivedEntry>): Promise<SurvivedEntry> {
    const row = await this.db.survivedEntry.create({
      data: { relationshipId, whatHappened: input.whatHappened!, howIFelt: input.howIFelt ?? "", whatILearned: input.whatILearned ?? "", howWeResolved: input.howWeResolved ?? "", doNotForget: input.doNotForget ?? "", resolved: input.resolved ?? false, createdBy: authorId },
    });
    return this.listSurvived(relationshipId).then((l) => l.find((s) => s.id === row.id)!);
  }

  async markSurvivedResolved(relationshipId: string, id: string): Promise<SurvivedEntry | null> {
    const row = await this.db.survivedEntry.updateMany({ where: { id, relationshipId }, data: { resolved: true } });
    if (row.count === 0) return null;
    return this.listSurvived(relationshipId).then((l) => l.find((s) => s.id === id) ?? null);
  }

  // ── Media registry ──────────────────────────────────────────

  async registerMedia(relationshipId: string, media: Memory["media"][number]): Promise<void> {
    await this.db.media.create({ data: { ...media, relationshipId } });
  }
}

export const prismaStore: DataStore = new PrismaStore();