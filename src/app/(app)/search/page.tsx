"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, SectionLabel, Input } from "@/components/ui";
import type { SearchResult } from "@/lib/server/system";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/search?q=" + encodeURIComponent(q));
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <SectionLabel>Search</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">Search your universe</h1>
        <p className="mt-1 max-w-lg text-sm text-fog">Find memories, letters, places, words — everything in your universe.</p>
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search memories, letters, places, songs…"
        autoFocus
        className="text-base"
      />

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

      {query && results.length === 0 && !loading ? (
        <p className="text-center text-sm text-mist">Nothing found for &ldquo;{query}&rdquo;</p>
      ) : null}
    </div>
  );
}