"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, SectionLabel, Input } from "@/components/ui";
import type { SearchResult } from "@/lib/server/system";

const KIND_OPTIONS = ["photo", "video", "voice", "text", "conversation", "place", "milestone", "little-thing"];
const MOOD_OPTIONS = ["joy", "love", "laughter", "tenderness", "peace", "yearning", "ache", "pride", "grateful", "wonder", "homesick", "ordinary"];
const YEARS = ["2024", "2025", "2026"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [mood, setMood] = useState("");
  const [year, setYear] = useState("");
  const [person, setPerson] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const hasAnyTerm = query.trim().length >= 2 || kind || mood || year || person.trim();

  const search = useCallback(async (filters: { q: string; kind: string; mood: string; year: string; person: string }) => {
    if (!filters.q.trim() && !filters.kind && !filters.mood && !filters.year && !filters.person.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q.trim()) params.set("q", filters.q.trim());
      if (filters.kind) params.set("kind", filters.kind);
      if (filters.mood) params.set("mood", filters.mood);
      if (filters.year) params.set("year", filters.year);
      if (filters.person.trim()) params.set("person", filters.person.trim());
      const res = await fetch("/api/search?" + params.toString());
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search({ q: query, kind, mood, year, person }), 250);
    return () => clearTimeout(t);
  }, [query, kind, mood, year, person, search]);

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <SectionLabel>Search</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">Search your universe</h1>
        <p className="mt-1 max-w-lg text-sm text-fog">Find memories, letters, places, words — and filter by kind, mood, person or year.</p>
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search memories, letters, places, songs…"
        autoFocus
        className="text-base"
      />

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="h-9 rounded-full border border-line bg-void/60 px-3.5 text-[13px] text-ink transition-colors focus:border-champagne/50 focus:outline-none"
        >
          <option value="">Any kind</option>
          {KIND_OPTIONS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="h-9 rounded-full border border-line bg-void/60 px-3.5 text-[13px] text-ink transition-colors focus:border-champagne/50 focus:outline-none"
        >
          <option value="">Any mood</option>
          {MOOD_OPTIONS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="h-9 rounded-full border border-line bg-void/60 px-3.5 text-[13px] text-ink transition-colors focus:border-champagne/50 focus:outline-none"
        >
          <option value="">Any year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <Input
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          placeholder="Who's in it…"
          className="h-9 w-40 rounded-full"
        />
      </div>

      {loading ? <p className="text-xs text-mist">Searching…</p> : null}

      <div className="space-y-2">
        {results.map((r) => (
          <Card
            key={`${r.type}-${r.id}`}
            className="group cursor-pointer p-4 transition-all hover:border-champagne/30"
            onClick={() => router.push(r.url)}
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-champagne-faint/30 px-2 py-0.5 font-mono text-[10px] uppercase text-champagne">
                {r.type}
              </span>
              {r.date ? (
                <span className="text-[10px] text-mist">
                  {new Date(r.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-medium text-ink group-hover:text-champagne-soft">{r.title}</p>
            {r.subtitle ? <p className="text-[11px] text-mist">{r.subtitle}</p> : null}
          </Card>
        ))}
      </div>

      {hasAnyTerm && results.length === 0 && !loading ? (
        <p className="text-center text-sm text-mist">Nothing found for those filters</p>
      ) : null}
    </div>
  );
}