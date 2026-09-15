import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui";

export default async function StoryPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const chapters = await store.listChapters(rel.id);
  const memories = await store.listMemories(rel.id);

  const memoriesByChapter = (chapterId: string) =>
    memories.filter((m) => m.chapterId === chapterId).sort((a, b) => a.date.localeCompare(b.date));
  const ungrouped = memories.filter((m) => !m.chapterId).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <SectionLabel>Relive Our Story</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">Our Story</h1>
        <p className="mt-1 max-w-lg text-sm text-fog">
          Every relationship has a shape. A beginning, a deepening, chapters you&rsquo;re still writing.
        </p>
      </div>

      {chapters.length === 0 && ungrouped.length === 0 ? (
        <EmptyState
          eyebrow="No chapters yet"
          title="Your story is just beginning"
          body="Add memories — each one is a line in the story of you two."
          action={<Link href="/memories"><Button size="sm">Add a memory</Button></Link>}
        />
      ) : null}

      {chapters.map((ch) => {
        const chMemories = memoriesByChapter(ch.id);
        return (
          <div key={ch.id} className="space-y-4">
            <div className="editorial-rule">
              <span className="font-display text-xl font-medium text-ivory">{ch.title}</span>
            </div>
            {ch.intro ? <p className="mx-auto max-w-lg text-center text-sm italic text-fog">{ch.intro}</p> : null}
            {chMemories.length === 0 ? (
              <p className="text-center text-xs text-mist">No memories in this chapter yet</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {chMemories.map((m) => (
                  <Link key={m.id} href={`/memories/${m.id}`}>
                    <Card className="group p-4 transition-all hover:border-champagne/30">
                      <Pill tone="gold" className="mb-2">{m.kind}</Pill>
                      <h3 className="text-sm font-medium text-ink group-hover:text-champagne-soft">{m.title}</h3>
                      <p className="mt-1 text-[11px] text-mist">{formatDate(m.date)}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {ungrouped.length > 0 && chapters.length > 0 ? (
        <div className="space-y-4">
          <div className="editorial-rule">
            <span className="font-display text-lg text-fog">Unassigned memories</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ungrouped.map((m) => (
              <Link key={m.id} href={`/memories/${m.id}`}>
                <Card className="group p-4 transition-all hover:border-champagne/30">
                  <Pill className="mb-2">{m.kind}</Pill>
                  <h3 className="text-sm font-medium text-ink group-hover:text-champagne-soft">{m.title}</h3>
                  <p className="mt-1 text-[11px] text-mist">{formatDate(m.date)}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}