import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";

/**
 * Private, authenticated archive export. Returns the full universe as a
 * downloadable JSON backup. Nothing public: requires a valid session and
 * only ever returns the caller's own relationship.
 */
export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const store = await getStore();
  const user = await store.findUserById(userId);
  if (!user?.relationshipId) return NextResponse.json({ error: "no relationship" }, { status: 404 });

  const relId = user.relationshipId;
  const [rel, memories, chapters, letters, places, goals, dict, firsts, little, sound, survive, capsules, reflections, openWhen, confessions] = await Promise.all([
    store.getRelationship(relId),
    store.listMemories(relId),
    store.listChapters(relId),
    store.listLetters(relId),
    store.listPlaces(relId),
    store.listGoals(relId),
    store.listDictionary(relId),
    store.listFirsts(relId),
    store.listLittleThings(relId),
    store.listSoundtrack(relId),
    store.listSurvived(relId),
    store.listTimeCapsules(relId),
    store.listReflections(relId),
    store.listOpenWhen(relId),
    store.listConfessions(relId),
  ]);

  const perspectiveMap = new Map<string, string[]>();
  for (const m of memories) {
    const perms = await store.listPerspectives(relId, m.id);
    perspectiveMap.set(m.id, perms.map((p) => `${p.authorName}: ${p.text}`));
  }

  const archive = {
    product: "US — a private universe for two",
    exportedAt: new Date().toISOString(),
    exportedBy: user.name,
    relationship: rel
      ? {
          name: rel.name,
          startDate: rel.startDate,
          code: rel.code,
          description: rel.description,
          members: rel.members,
        }
      : null,
    memories: memories.map((m) => ({
      title: m.title,
      kind: m.kind,
      date: m.date,
      description: m.description,
      locationName: m.locationName,
      mood: m.mood,
      people: m.people,
      tags: m.tags,
      status: m.status,
      createdByName: m.createdByName,
      media: m.media.map((x) => ({ type: x.type, url: x.url, mime: x.mime })),
      perspectives: perspectiveMap.get(m.id) ?? [],
    })),
    story: chapters.map((c) => ({ order: c.order, code: c.code, title: c.title, epigraph: c.epigraph, intro: c.intro })),
    letters: letters.map((l) => ({ title: l.title, category: l.category, authorName: l.authorName, body: l.body, createdAt: l.createdAt })),
    openWhen: openWhen.map((o) => ({ title: o.title, authorName: o.authorName, body: o.body, lockBehavior: o.lockBehavior, locked: o.locked })),
    confessions: confessions.map((c) => ({ authorName: c.authorName, text: c.text, visibility: c.visibility, revealAt: c.revealAt })),
    dictionary: dict.map((d) => ({ word: d.word, meaning: d.meaning, inventorName: d.inventorName, origin: d.origin, example: d.example, usedSince: d.usedSince })),
    littleThings: little.map((l) => ({ what: l.what, why: l.why, date: l.date })),
    firsts: firsts.map((f) => ({ title: f.title, date: f.date, description: f.description })),
    places: places.map((p) => ({ name: p.name, latitude: p.latitude, longitude: p.longitude, date: p.date, story: p.story })),
    soundtrack: sound.map((s) => ({ title: s.song.title, artist: s.song.artist, why: s.why, date: s.date })),
    goals: goals.map((g) => ({ title: g.title, category: g.category, progress: g.progress, completed: g.completed, targetDate: g.targetDate })),
    capsules: capsules.map((c) => ({ title: c.title, note: c.note, unlockAt: c.unlockAt, status: c.status })),
    reflections: reflections.map((r) => ({ question: r.question, answer: r.answer, authorName: r.authorName })),
    whatWeSurvived: survive.map((s) => ({ whatHappened: s.whatHappened, howIFelt: s.howIFelt, whatILearned: s.whatILearned, howWeResolved: s.howWeResolved, doNotForget: s.doNotForget, resolved: s.resolved })),
  };

  const safeName = (rel?.name ?? "us").replace(/[^\w~-]+/g, "-");
  const body = JSON.stringify(archive, null, 2);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="us-${safeName}-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}