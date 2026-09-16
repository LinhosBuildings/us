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

  const countFor = (id: string) => memories.filter((m) => m.chapterId === id).length;
  const ungrouped = memories.filter((m) => !m.chapterId).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="text-center">
        <SectionLabel>How We Happened</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">How We Happened</h1>
        <p className="mx-auto mt-1 max-w-lg text-sm text-fog">
          Every relationship has a shape. A beginning, a deepening, chapters you&rsquo;re still writing.
        </p>
      </div>

      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        <StoryLink href="/story" label="Chapters" active />
        <StoryLink href="/survived" label="What We've Been Through" />
      </div>

      {chapters.length === 0 && ungrouped.length === 0 ? (
        <EmptyState
          eyebrow="No chapters yet"
          title="Your story is just beginning"
          body="Add memories — each one is a line in the story of you two."
          action={<Link href="/memories"><Button size="sm">Add a memory</Button></Link>}
        />
      ) : null}

      {/* chapter index */}
      <div className="space-y-3">
        {chapters.map((ch) => (
          <Link key={ch.id} href={`/story/${ch.id}`}>
            <Card className="group flex items-center gap-4 p-5 transition-all hover:border-champagne/30">
              <span className="hidden font-mono text-[11px] text-champagne/60 sm:block">{ch.order.toString().padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="gold">{ch.code}</Pill>
                  {ch.epigraph ? (
                    <span className="hidden truncate font-display text-sm italic text-champagne/60 sm:block">
                      “{ch.epigraph}”
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-1.5 truncate text-base font-medium text-ink transition-colors group-hover:text-champagne-soft">
                  {ch.title}
                </h3>
              </div>
              <div className="shrink-0 text-right">
                <span className="block font-mono text-[11px] text-mist">
                  {countFor(ch.id)} {countFor(ch.id) === 1 ? "memory" : "memories"}
                </span>
                <span className="mt-1 block text-champagne transition-transform group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* unassigned memories */}
      {ungrouped.length > 0 ? (
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

function StoryLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  const cls = active
    ? "whitespace-nowrap rounded-full border border-champagne/40 bg-champagne-faint px-3.5 py-1.5 text-[12px] text-champagne-soft"
    : "whitespace-nowrap rounded-full border border-line-strong px-3.5 py-1.5 text-[12px] text-fog transition-colors hover:border-champagne/40 hover:text-champagne-soft";
  return <Link href={href} className={cls}>{label}</Link>;
}