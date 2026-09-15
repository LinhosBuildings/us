import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill, EmptyState, Button } from "@/components/ui";
import { formatDate, pluralize } from "@/lib/utils";

export default async function MemoriesListPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const memories = await store.listMemories(rel.id);
  const sorted = [...memories].sort((a, b) => b.date.localeCompare(a.date));

  // group by year-month for timeline
  const groups = new Map<string, typeof sorted>();
  for (const m of sorted) {
    const key = new Date(m.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="flex items-end justify-between gap-4">
        <div>
          <SectionLabel>Memories</SectionLabel>
          <h1 className="font-display text-3xl font-medium text-ivory">Our Memories</h1>
        </div>
        <p className="text-[11px] text-mist">{pluralize(memories.length, "memory")}</p>
      </div>

      {memories.length === 0 ? (
        <EmptyState
          eyebrow="Empty canvas"
          title="No memories yet"
          body="Photos, moments, little things — they all count. Start collecting."
          action={<Link href="/memories"><Button size="sm">Add a memory</Button></Link>}
        />
      ) : null}

      {[...groups.entries()].map(([label, items]) => (
        <div key={label} className="space-y-3">
          <SectionLabel>{label}</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((m) => (
              <Link key={m.id} href={`/memories/${m.id}`}>
                <Card className="group p-4 transition-all hover:border-champagne/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill tone="gold">{m.kind}</Pill>
                    {m.mood ? <Pill>{m.mood}</Pill> : null}
                  </div>
                  <h3 className="text-sm font-medium text-ink group-hover:text-champagne-soft">{m.title}</h3>
                  {m.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-fog">{m.description.slice(0, 140)}</p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-mist">
                    <span>{formatDate(m.date)}</span>
                    {m.locationName ? <span className="text-sage">📍 {m.locationName}</span> : null}
                    <span>by {m.createdByName}</span>
                  </div>
                  {m.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.tags.slice(0, 5).map((t) => (
                        <span key={t} className="rounded-full bg-champagne-faint/30 px-2 py-0.5 font-mono text-[10px] text-champagne">
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}