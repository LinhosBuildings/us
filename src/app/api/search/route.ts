import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import type { SearchResult } from "@/lib/server/system";

const MEMORY_KIND_FILTER = new Set(["photo", "video", "voice", "text", "conversation", "place", "milestone", "little-thing"]);
const MOOD_FILTER = new Set(["joy", "love", "laughter", "tenderness", "peace", "yearning", "ache", "pride", "grateful", "wonder", "homesick", "ordinary"]);

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim()?.toLowerCase() ?? "";
  const kind = sp.get("kind") ?? "";
  const mood = sp.get("mood") ?? "";
  const person = sp.get("person")?.trim()?.toLowerCase() ?? "";
  const place = sp.get("place")?.trim()?.toLowerCase() ?? "";
  const year = sp.get("year") ?? "";
  const chapter = sp.get("chapter")?.trim()?.toLowerCase() ?? "";

  const store = await getStore();
  const user = await store.findUserById(userId);
  if (!user?.relationshipId) return NextResponse.json([]);

  const hasText = q.length >= 2;
  const byKind = MEMORY_KIND_FILTER.has(kind) ? kind : "";
  const byMood = MOOD_FILTER.has(mood) ? mood : "";

  const relId = user.relationshipId;
  const out: SearchResult[] = [];
  const push = (r: SearchResult) => out.push(r);

  const [memories, letters, places, dict, goals, firsts, little, sound, chapters] = await Promise.all([
    store.listMemories(relId),
    store.listLetters(relId),
    store.listPlaces(relId),
    store.listDictionary(relId),
    store.listGoals(relId),
    store.listFirsts(relId),
    store.listLittleThings(relId),
    store.listSoundtrack(relId),
    store.listChapters(relId),
  ]);

  const chapterTitleById = new Map(chapters.map((c) => [c.id, c.title.toLowerCase()]));
  const chapterCodeById = new Map(chapters.map((c) => [c.id, c.code.toLowerCase()]));

  const matchesMemory = (m: (typeof memories)[number]): boolean => {
    if (byKind && m.kind !== byKind) return false;
    if (byMood && m.mood !== byMood) return false;
    if (year && !/^\d{4}$/.test(year)) return false;
    if (year && !m.date.startsWith(year)) return false;
    if (person) {
      const hay = `${m.people.join(" ")} ${m.createdByName}`.toLowerCase();
      if (!hay.includes(person)) return false;
    }
    if (place) {
      if (!(m.locationName ?? "").toLowerCase().includes(place)) return false;
    }
    if (chapter) {
      const ch = chapterTitleById.get(m.chapterId ?? "") ?? "";
      const code = chapterCodeById.get(m.chapterId ?? "") ?? "";
      if (!ch.includes(chapter) && !code.includes(chapter)) return false;
    }
    if (hasText) {
      const hay = `${m.title} ${m.description} ${m.locationName ?? ""} ${m.tags.join(" ")} ${m.people.join(" ")} ${m.createdByName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  };

  const hasAnyFilter = Boolean(byKind || byMood || year || person || place || chapter || hasText);

  if (hasAnyFilter) {
    for (const m of memories) {
      if (matchesMemory(m)) {
        push({ id: m.id, type: "memory", title: m.title, subtitle: m.locationName ?? m.createdByName, date: m.date, url: `/memories/${m.id}` });
      }
    }
  }

  // Text-only search across other collections (only when no structural filter skews results)
  if (hasText && !byKind && !byMood && !year && !person && !place && !chapter) {
    for (const l of letters) {
      if (`${l.title} ${l.body} ${l.authorName}`.toLowerCase().includes(q)) {
        push({ id: l.id, type: "letter", title: l.title, subtitle: `A letter · ${l.authorName}`, date: l.createdAt, url: `/letters` });
      }
    }
    for (const p of places) {
      if (`${p.name} ${p.story ?? ""}`.toLowerCase().includes(q)) {
        push({ id: p.id, type: "place", title: p.name, subtitle: "A place that holds us", url: "/world" });
      }
    }
    for (const d of dict) {
      if (`${d.word} ${d.meaning}`.toLowerCase().includes(q)) {
        push({ id: d.id, type: "dictionary", title: d.word, subtitle: "Our language", url: "/dictionary" });
      }
    }
    for (const g of goals) {
      if (`${g.title} ${g.description ?? ""}`.toLowerCase().includes(q)) {
        push({ id: g.id, type: "goal", title: g.title, subtitle: "A dream we're growing", url: "/future" });
      }
    }
    for (const f of firsts) {
      if (`${f.title} ${f.description ?? ""}`.toLowerCase().includes(q)) {
        push({ id: f.id, type: "first", title: f.title, subtitle: "A first", url: "/firsts" });
      }
    }
    for (const l of little) {
      if (`${l.what} ${l.why ?? ""}`.toLowerCase().includes(q)) {
        push({ id: l.id, type: "little-thing", title: l.what.slice(0, 80), subtitle: "A little thing", url: "/little-things" });
      }
    }
    for (const s of sound) {
      if (`${s.song.title} ${s.song.artist}`.toLowerCase().includes(q)) {
        push({ id: s.id, type: "song", title: `${s.song.title} — ${s.song.artist}`, subtitle: "Soundtrack", url: "/soundtrack" });
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
  }

  return NextResponse.json(out.slice(0, 60));
}