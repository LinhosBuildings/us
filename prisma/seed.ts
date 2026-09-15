// US — production database seed (PostgreSQL via Supabase).
// Mirrors the demo seed so prod starts with the same real BIGGY~LINHO content.
// Run: npx prisma db seed
//
// Only real, supplied information is seeded. Personal collections (letters,
// open-when, confessions, dictionary, little things, soundtrack, goals,
// capsules, reflections, survived) start empty — the couple fills them in.

import { PrismaClient } from "@prisma/client";
import {
  REL,
  LINHO,
  BIGGY,
  seedUsers,
  seedRelationship,
  seedChapters,
} from "../src/lib/data/demo/seed-core";
import { seedMemories, seedPerspectives } from "../src/lib/data/demo/seed-memories";
import { seedLetters, seedOpenWhen, seedConfessions } from "../src/lib/data/demo/seed-letters";
import {
  seedDictionary,
  seedLittleThings,
  seedFirsts,
  seedPlaces,
  seedSoundtrack,
  seedGoals,
  buildSeedCapsules,
  seedReflections,
  seedSurvived,
} from "../src/lib/data/demo/seed-world";

const prisma = new PrismaClient();

async function main() {
  // Users
  for (const u of seedUsers) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { name: u.name, email: u.email, avatarUrl: u.avatarUrl, relationshipId: u.relationshipId },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: "",
        avatarUrl: u.avatarUrl,
        relationshipId: u.relationshipId,
      },
    });
  }

  // Relationship
  await prisma.relationship.upsert({
    where: { id: REL },
    update: {
      code: seedRelationship.code,
      secretCode: seedRelationship.secretCode,
      name: seedRelationship.name,
      title: seedRelationship.title ?? null,
      description: seedRelationship.description ?? null,
      startDate: new Date(seedRelationship.startDate),
      coverImageUrl: seedRelationship.coverImageUrl ?? null,
    },
    create: {
      id: REL,
      code: seedRelationship.code,
      secretCode: seedRelationship.secretCode,
      name: seedRelationship.name,
      title: seedRelationship.title ?? null,
      description: seedRelationship.description ?? null,
      startDate: new Date(seedRelationship.startDate),
      coverImageUrl: seedRelationship.coverImageUrl ?? null,
      createdAt: new Date(seedRelationship.createdAt ?? "2025-01-01T00:00:00.000Z"),
    },
  });

  // Members
  for (const m of seedRelationship.members) {
    await prisma.relationshipMember.upsert({
      where: { relationshipId_userId: { relationshipId: REL, userId: m.id } },
      update: { isOwner: m.isOwner },
      create: { relationshipId: REL, userId: m.id, isOwner: m.isOwner },
    });
  }

  // Chapters
  for (const c of seedChapters) {
    await prisma.chapter.upsert({
      where: { id: c.id },
      update: {
        relationshipId: c.relationshipId,
        order: c.order,
        code: c.code,
        title: c.title,
        epigraph: c.epigraph ?? null,
        intro: c.intro ?? null,
      },
      create: {
        id: c.id,
        relationshipId: c.relationshipId,
        order: c.order,
        code: c.code,
        title: c.title,
        epigraph: c.epigraph ?? null,
        intro: c.intro ?? null,
      },
    });
  }

  // Memories (+ their media)
  for (const mem of seedMemories) {
    const milestone = (mem as any).milestone as { label?: string; category?: string } | undefined;
    const data = {
      relationshipId: mem.relationshipId,
      title: mem.title,
      kind: mem.kind,
      date: new Date(mem.date),
      description: mem.description ?? "",
      locationName: mem.locationName ?? null,
      mood: mem.mood ?? null,
      people: mem.people ?? [],
      tags: mem.tags ?? [],
      visibility: mem.visibility ?? "both",
      neverTold: mem.neverTold ?? null,
      constellationX: mem.constellationX ?? null,
      constellationY: mem.constellationY ?? null,
      chapterId: mem.chapterId ?? null,
      milestoneLabel: milestone?.label ?? null,
      milestoneCategory: milestone?.category ?? null,
      status: mem.status ?? null,
      createdBy: mem.createdBy,
      createdAt: new Date(mem.createdAt ?? "2025-01-01T00:00:00.000Z"),
    };
    await prisma.memory.upsert({
      where: { id: mem.id },
      update: data,
      create: { id: mem.id, ...data },
    });
    for (const asset of mem.media ?? []) {
      await prisma.mediaAsset.upsert({
        where: { id: asset.id },
        update: {
          relationshipId: mem.relationshipId,
          type: asset.type,
          url: asset.url,
          thumbnailUrl: asset.thumbnailUrl ?? null,
          width: asset.width ?? null,
          height: asset.height ?? null,
          durationMs: asset.durationMs ?? null,
          mime: asset.mime,
          sizeBytes: asset.sizeBytes,
        },
        create: {
          id: asset.id,
          relationshipId: mem.relationshipId,
          type: asset.type,
          url: asset.url,
          thumbnailUrl: asset.thumbnailUrl ?? null,
          width: asset.width ?? null,
          height: asset.height ?? null,
          durationMs: asset.durationMs ?? null,
          mime: asset.mime,
          sizeBytes: asset.sizeBytes,
          createdAt: new Date(asset.createdAt ?? "2025-01-01T00:00:00.000Z"),
        },
      });
      await prisma.memoryMedia.upsert({
        where: { memoryId_mediaId: { memoryId: mem.id, mediaId: asset.id } },
        update: {},
        create: { memoryId: mem.id, mediaId: asset.id },
      });
    }
  }

  // Perspectives (seeded empty — kept for completeness)
  for (const p of seedPerspectives) {
    await prisma.perspective.upsert({
      where: { id: p.id },
      update: { memoryId: p.memoryId, authorId: p.authorId, authorName: p.authorName, text: p.text },
      create: {
        id: p.id,
        memoryId: p.memoryId,
        authorId: p.authorId,
        authorName: p.authorName,
        text: p.text,
        createdAt: new Date(p.createdAt ?? "2025-01-01T00:00:00.000Z"),
      },
    });
  }

  // Expressions (letters / open-when / confessions) — empty seed
  for (const l of seedLetters) {
    await prisma.letter.upsert({
      where: { id: l.id },
      update: { relationshipId: l.relationshipId, authorId: l.authorId, title: l.title, category: l.category, body: l.body, lockAt: l.lockAt ? new Date(l.lockAt) : null },
      create: {
        id: l.id,
        relationshipId: l.relationshipId,
        authorId: l.authorId,
        title: l.title,
        category: l.category,
        body: l.body,
        lockAt: l.lockAt ? new Date(l.lockAt) : null,
      },
    });
  }
  for (const o of seedOpenWhen) {
    await prisma.openWhen.upsert({
      where: { id: o.id },
      update: {
        relationshipId: o.relationshipId,
        authorId: o.authorId,
        title: o.title,
        body: o.body,
        lockBehavior: o.lockBehavior,
        unlockAt: o.unlockAt ? new Date(o.unlockAt) : null,
        interactionHint: o.interactionHint ?? null,
        locked: o.locked ?? true,
      },
      create: {
        id: o.id,
        relationshipId: o.relationshipId,
        authorId: o.authorId,
        title: o.title,
        body: o.body,
        lockBehavior: o.lockBehavior,
        unlockAt: o.unlockAt ? new Date(o.unlockAt) : null,
        interactionHint: o.interactionHint ?? null,
        locked: o.locked ?? true,
      },
    });
  }
  for (const c of seedConfessions) {
    await prisma.confession.upsert({
      where: { id: c.id },
      update: { relationshipId: c.relationshipId, authorId: c.authorId, text: c.text, visibility: c.visibility, revealAt: c.revealAt ? new Date(c.revealAt) : null },
      create: {
        id: c.id,
        relationshipId: c.relationshipId,
        authorId: c.authorId,
        text: c.text,
        visibility: c.visibility,
        revealAt: c.revealAt ? new Date(c.revealAt) : null,
      },
    });
  }

  // World: dictionary / little things / soundtrack / goals / capsules / reflections / survived
  for (const d of seedDictionary) {
    await prisma.dictionaryEntry.upsert({
      where: { id: d.id },
      update: {
        relationshipId: d.relationshipId,
        word: d.word,
        meaning: d.meaning,
        inventorId: d.inventorId ?? null,
        inventorName: d.inventorName ?? null,
        origin: d.origin ?? null,
        example: d.example ?? null,
        usedSince: d.usedSince ?? null,
        audioId: d.audioId ?? null,
      },
      create: {
        id: d.id,
        relationshipId: d.relationshipId,
        word: d.word,
        meaning: d.meaning,
        inventorId: d.inventorId ?? null,
        inventorName: d.inventorName ?? null,
        origin: d.origin ?? null,
        example: d.example ?? null,
        usedSince: d.usedSince ?? null,
        audioId: d.audioId ?? null,
      },
    });
  }
  for (const t of seedLittleThings) {
    await prisma.littleThing.upsert({
      where: { id: t.id },
      update: { relationshipId: t.relationshipId, authorId: t.authorId, what: t.what, why: t.why ?? null, date: t.date ? new Date(t.date) : null },
      create: {
        id: t.id,
        relationshipId: t.relationshipId,
        authorId: t.authorId,
        what: t.what,
        why: t.why ?? null,
        date: t.date ? new Date(t.date) : null,
      },
    });
  }
  for (const f of seedFirsts) {
    await prisma.firstRecord.upsert({
      where: { id: f.id },
      update: {
        relationshipId: f.relationshipId,
        title: f.title,
        date: f.date ? new Date(f.date) : null,
        description: f.description ?? null,
        imageUrl: (f as any).imageUrl ?? null,
        createdBy: f.createdBy,
      },
      create: {
        id: f.id,
        relationshipId: f.relationshipId,
        title: f.title,
        date: f.date ? new Date(f.date) : null,
        description: f.description ?? null,
        imageUrl: (f as any).imageUrl ?? null,
        createdBy: f.createdBy,
      },
    });
  }
  for (const p of seedPlaces) {
    await prisma.place.upsert({
      where: { id: p.id },
      update: {
        relationshipId: p.relationshipId,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        date: p.date ? new Date(p.date) : null,
        story: p.story ?? null,
        memoryIds: p.memoryIds ?? [],
      },
      create: {
        id: p.id,
        relationshipId: p.relationshipId,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        date: p.date ? new Date(p.date) : null,
        story: p.story ?? null,
        memoryIds: p.memoryIds ?? [],
      },
    });
  }
  for (const s of seedSoundtrack) {
    await prisma.soundtrackSong.upsert({
      where: { id: s.id ?? `s_${s.title}` },
      update: {
        relationshipId: REL,
        title: s.title,
        artist: s.artist,
        externalUrl: s.externalUrl ?? null,
        memoryTitle: (s as any).memoryTitle ?? null,
        why: (s as any).why ?? null,
        date: (s as any).date ? new Date((s as any).date) : null,
      },
      create: {
        relationshipId: REL,
        title: s.title,
        artist: s.artist,
        externalUrl: s.externalUrl ?? null,
        memoryTitle: (s as any).memoryTitle ?? null,
        why: (s as any).why ?? null,
        date: (s as any).date ? new Date((s as any).date) : null,
      },
    });
  }
  for (const g of seedGoals) {
    await prisma.futureGoal.upsert({
      where: { id: g.id },
      update: {
        relationshipId: g.relationshipId,
        title: g.title,
        description: g.description ?? null,
        category: g.category,
        targetDate: g.targetDate ? new Date(g.targetDate) : null,
        progress: g.progress ?? 0,
        imageUrl: g.imageUrl ?? null,
        completed: g.completed ?? false,
        createdBy: g.createdBy,
      },
      create: {
        id: g.id,
        relationshipId: g.relationshipId,
        title: g.title,
        description: g.description ?? null,
        category: g.category,
        targetDate: g.targetDate ? new Date(g.targetDate) : null,
        progress: g.progress ?? 0,
        imageUrl: g.imageUrl ?? null,
        completed: g.completed ?? false,
        createdBy: g.createdBy,
      },
    });
  }
  for (const c of buildSeedCapsules()) {
    await prisma.timeCapsule.upsert({
      where: { id: c.id },
      update: {
        relationshipId: c.relationshipId,
        title: c.title,
        note: c.note ?? null,
        unlockAt: new Date(c.unlockAt),
        questions: c.questions ?? [],
        predictions: c.predictions ?? [],
        status: c.status ?? "sealed",
        openedAt: c.openedAt ? new Date(c.openedAt) : null,
      },
      create: {
        id: c.id,
        relationshipId: c.relationshipId,
        title: c.title,
        note: c.note ?? null,
        unlockAt: new Date(c.unlockAt),
        questions: c.questions ?? [],
        predictions: c.predictions ?? [],
        status: c.status ?? "sealed",
        openedAt: c.openedAt ? new Date(c.openedAt) : null,
      },
    });
  }
  for (const r of seedReflections) {
    await prisma.reflection.upsert({
      where: { id: r.id },
      update: { relationshipId: r.relationshipId, question: r.question, answer: r.answer, authorId: r.authorId, authorName: r.authorName },
      create: {
        id: r.id,
        relationshipId: r.relationshipId,
        question: r.question,
        answer: r.answer,
        authorId: r.authorId,
        authorName: r.authorName,
        createdAt: new Date(r.createdAt ?? "2025-01-01T00:00:00.000Z"),
      },
    });
  }
  for (const s of seedSurvived) {
    await prisma.survivedEntry.upsert({
      where: { id: s.id },
      update: {
        relationshipId: s.relationshipId,
        whatHappened: s.whatHappened,
        howIFelt: s.howIFelt ?? null,
        whatILearned: s.whatILearned ?? null,
        howWeResolved: s.howWeResolved ?? null,
        doNotForget: s.doNotForget ?? null,
        resolved: s.resolved ?? false,
        createdBy: s.createdBy,
      },
      create: {
        id: s.id,
        relationshipId: s.relationshipId,
        whatHappened: s.whatHappened,
        howIFelt: s.howIFelt ?? null,
        whatILearned: s.whatILearned ?? null,
        howWeResolved: s.howWeResolved ?? null,
        doNotForget: s.doNotForget ?? null,
        resolved: s.resolved ?? false,
        createdBy: s.createdBy,
        createdAt: new Date(s.createdAt ?? "2025-01-01T00:00:00.000Z"),
      },
    });
  }

  console.log(
    `Seeded BIGGY~LINHO universe: users (${seedUsers.length}), relationship ${REL}, chapters (${seedChapters.length}), memories (${seedMemories.length}), firsts (${seedFirsts.length}), places (${seedPlaces.length}).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());