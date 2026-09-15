import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import type { SearchResult } from "@/lib/server/system";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim()?.toLowerCase() ?? "";
  if (!q || q.length < 2) return NextResponse.json([]);

  const store = await getStore();
  const user = await store.findUserById(userId);
  if (!user?.relationshipId) return NextResponse.json([]);

  const relId = user.relationshipId;
  const out: SearchResult[] = [];
  const push = (r: SearchResult) => out.push(r);

  const [memories, letters, places, dict, goals, firsts, little, sound] = await Promise.all([
    store.listMemories(relId),
    store.listLetters(relId),
    store.listPlaces(relId),
    store.listDictionary(relId),
    store.listGoals(relId),
    store.listFirsts(relId),
    store.listLittleThings(relId),
    store.listSoundtrack(relId),
  ]);

  for (const m of memories) {
    const hay = `${m.title} ${m.description} ${m.locationName ?? ""} ${m.tags.join(" ")} ${m.people.join(" ")} ${m.createdByName}`.toLowerCase();
    if (hay.includes(q)) {
      push({ id: m.id, type: "memory", title: m.title, subtitle: m.locationName ?? m.createdByName, date: m.date, url: `/memories/${m.id}` });
    }
  }
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

  // date match — "2025" or "august" etc
  if (/^\d{4}$/.test(q)) {
    for (const m of memories) {
      if (m.date.slice(0, 4) === q) {
        push({ id: m.id, type: "memory", title: m.title, subtitle: m.locationName ?? m.createdByName, date: m.date, url: `/memories/${m.id}` });
      }
    }
  }

  return NextResponse.json(out.slice(0, 40));
}