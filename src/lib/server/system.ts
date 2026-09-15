"use server";

import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { computeCounter } from "@/lib/relationship-counter";
import type { GoalCategory } from "@/lib/types";

export interface SearchResult {
  id: string;
  type: "memory" | "letter" | "place" | "dictionary" | "goal" | "first" | "little-thing" | "song" | "capsule" | "chapter";
  title: string;
  subtitle?: string;
  date?: string;
  url: string;
}

export async function searchUniverse(query: string): Promise<SearchResult[]> {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const out: SearchResult[] = [];
  const push = (r: SearchResult) => out.push(r);

  const memories = await store.listMemories(rel.id);
  for (const m of memories) {
    const hay = `${m.title} ${m.description} ${m.locationName ?? ""} ${m.tags.join(" ")} ${m.people.join(" ")} ${m.createdByName}`.toLowerCase();
    if (hay.includes(q)) {
      push({ id: m.id, type: "memory", title: m.title, subtitle: m.locationName ?? m.createdByName, date: m.date, url: `/memories/${m.id}` });
    }
  }

  const letters = await store.listLetters(rel.id);
  for (const l of letters) {
    if (`${l.title} ${l.body} ${l.authorName}`.toLowerCase().includes(q)) {
      push({ id: l.id, type: "letter", title: l.title, subtitle: `A letter · ${l.authorName}`, date: l.createdAt, url: `/letters/${l.id}` });
    }
  }

  const places = await store.listPlaces(rel.id);
  for (const p of places) {
    if (`${p.name} ${p.story ?? ""}`.toLowerCase().includes(q)) {
      push({ id: p.id, type: "place", title: p.name, subtitle: "A place that holds us", url: "/world" });
    }
  }

  const dict = await store.listDictionary(rel.id);
  for (const d of dict) {
    if (`${d.word} ${d.meaning} ${d.origin ?? ""}`.toLowerCase().includes(q)) {
      push({ id: d.id, type: "dictionary", title: d.word, subtitle: "Our language", url: "/dictionary" });
    }
  }

  const goals = await store.listGoals(rel.id);
  for (const g of goals) {
    if (`${g.title} ${g.description ?? ""}`.toLowerCase().includes(q)) {
      push({ id: g.id, type: "goal", title: g.title, subtitle: "A dream we're growing", url: "/future" });
    }
  }

  const firsts = await store.listFirsts(rel.id);
  for (const f of firsts) {
    if (`${f.title} ${f.description ?? ""}`.toLowerCase().includes(q)) {
      push({ id: f.id, type: "first", title: f.title, subtitle: "A first", date: f.date ?? undefined, url: "/firsts" });
    }
  }

  const little = await store.listLittleThings(rel.id);
  for (const l of little) {
    if (`${l.what} ${l.why ?? ""}`.toLowerCase().includes(q)) {
      push({ id: l.id, type: "little-thing", title: l.what.slice(0, 80), subtitle: "A little thing", url: "/memories" });
    }
  }

  const songs = await store.listSoundtrack(rel.id);
  for (const s of songs) {
    if (`${s.song.title} ${s.song.artist} ${s.why ?? ""}`.toLowerCase().includes(q)) {
      push({ id: s.id, type: "song", title: `${s.song.title} — ${s.song.artist}`, subtitle: "The soundtrack of us", url: "/soundtrack" });
    }
  }

  // date match — "2025" should surface that year's timeline
  if (/^\d{4}$/.test(q)) {
    for (const m of memories) {
      if (m.date.slice(0, 4) === q) {
        push({ id: m.id, type: "memory", title: m.title, subtitle: m.locationName ?? m.createdByName, date: m.date, url: `/memories/${m.id}` });
      }
    }
  }

  return out.slice(0, 40);
}

export interface StatsData {
  counter: ReturnType<typeof computeCounter>;
  counts: {
    memories: number;
    photos: number;
    videos: number;
    voiceNotes: number;
    places: number;
    letters: number;
    firsts: number;
    dictionary: number;
    littleThings: number;
    goals: number;
    goalsCompleted: number;
    capsules: number;
    perspectives: number;
  };
}

export async function getStats(): Promise<StatsData | null> {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;

  const [memories, places, letters, firsts, dict, little, goals, capsules] = await Promise.all([
    store.listMemories(rel.id),
    store.listPlaces(rel.id),
    store.listLetters(rel.id),
    store.listFirsts(rel.id),
    store.listDictionary(rel.id),
    store.listLittleThings(rel.id),
    store.listGoals(rel.id),
    store.listTimeCapsules(rel.id),
  ]);

  let photos = 0, videos = 0, voiceNotes = 0;
  for (const m of memories) {
    for (const media of m.media) {
      if (media.type === "image") photos++;
      else if (media.type === "video") videos++;
      else if (media.type === "audio") voiceNotes++;
    }
  }

  let perspectiveCount = 0;
  for (const m of memories) {
    perspectiveCount += (await store.listPerspectives(rel.id, m.id)).length;
  }

  return {
    counter: computeCounter(rel.startDate),
    counts: {
      memories: memories.length,
      photos,
      videos,
      voiceNotes,
      places: places.length,
      letters: letters.length,
      firsts: firsts.length,
      dictionary: dict.length,
      littleThings: little.length,
      goals: goals.length,
      goalsCompleted: goals.filter((g) => g.completed).length,
      capsules: capsules.length,
      perspectives: perspectiveCount,
    },
  };
}

export async function getUniverseSeed() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const [memories, chapters, letters, places, goals, capsules, firsts, survive, little, sound, dict] =
    await Promise.all([
      store.listMemories(rel.id),
      store.listChapters(rel.id),
      store.listLetters(rel.id),
      store.listPlaces(rel.id),
      store.listGoals(rel.id),
      store.listTimeCapsules(rel.id),
      store.listFirsts(rel.id),
      store.listSurvived(rel.id),
      store.listLittleThings(rel.id),
      store.listSoundtrack(rel.id),
      store.listDictionary(rel.id),
    ]);
  const perspectivesByMemory = new Map<string, number>();
  for (const m of memories) {
    const perms = await store.listPerspectives(rel.id, m.id);
    perspectivesByMemory.set(m.id, perms.length);
  }
  return {
    relationship: rel,
    me: { id: user.id, name: user.name },
    memories,
    chapters,
    letters,
    places,
    goals,
    capsules,
    firsts,
    survive,
    little,
    sound,
    dict,
    totalMemories: memories.length,
  };
}

export async function exportArchiveSummary() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const [memories, letters, places, goals, dict, firsts, little, sound, survive, capsules] = await Promise.all([
    store.listMemories(rel.id),
    store.listLetters(rel.id),
    store.listPlaces(rel.id),
    store.listGoals(rel.id),
    store.listDictionary(rel.id),
    store.listFirsts(rel.id),
    store.listLittleThings(rel.id),
    store.listSoundtrack(rel.id),
    store.listSurvived(rel.id),
    store.listTimeCapsules(rel.id),
  ]);

  const archive = {
    relationship: {
      name: rel.name,
      startDate: rel.startDate,
      code: rel.code,
    },
    exportedAt: new Date().toISOString(),
    memories: memories.map((m) => ({
      title: m.title,
      kind: m.kind,
      date: m.date,
      description: m.description,
      locationName: m.locationName,
      mood: m.mood,
      tags: m.tags,
      createdByName: m.createdByName,
      mediaCount: m.media.length,
    })),
    letters: letters.map((l) => ({ title: l.title, category: l.category, authorName: l.authorName, createdAt: l.createdAt })),
    places: places.map((p) => ({ name: p.name, latitude: p.latitude, longitude: p.longitude, story: p.story })),
    goals: goals.map((g) => ({ title: g.title, category: g.category, progress: g.progress, completed: g.completed })),
    dictionary: dict.map((d) => ({ word: d.word, meaning: d.meaning })),
    firsts: firsts.map((f) => ({ title: f.title })),
    littleThings: little.map((l) => ({ what: l.what })),
    soundtrack: sound.map((s) => ({ title: s.song.title, artist: s.song.artist })),
    whatWeSurvived: survive.map((s) => ({ whatHappened: s.whatHappened, resolved: s.resolved })),
    timeCapsules: capsules.map((c) => ({ title: c.title, unlockAt: c.unlockAt, status: c.status })),
  };

  return {
    json: JSON.stringify(archive, null, 2),
    stats: {
      memories: memories.length,
      letters: letters.length,
      places: places.length,
      goals: goals.length,
    },
  };
}

export async function goalCategoryLabel(c: GoalCategory) {
  const map: Record<GoalCategory, string> = {
    love: "Love",
    career: "Career",
    home: "Home",
    travel: "Travel",
    finances: "Finances",
    family: "Family",
    adventures: "Adventures",
  };
  return map[c];
}