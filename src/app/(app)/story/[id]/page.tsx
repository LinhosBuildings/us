import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) notFound();

  const chapters = await store.listChapters(rel.id);
  const index = chapters.findIndex((c) => c.id === id);
  const chapter = index === -1 ? null : chapters[index];
  if (!chapter) notFound();

  const memories = (await store.listMemories(rel.id))
    .filter((m) => m.chapterId === chapter.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const prev = chapters[index - 1];
  const next = chapters[index + 1];

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-24 md:pb-0">
      <div className="text-center">
        <Link href="/story" className="mb-4 inline-flex items-center gap-1 text-[12px] text-champagne hover:text-champagne-soft">
          ← Our Story
        </Link>
        <SectionLabel>{chapter.code}</SectionLabel>
        <h1 className="mt-2 font-display text-3xl font-medium text-ivory md:text-4xl">{chapter.title}</h1>
        {chapter.epigraph ? (
          <p className="mt-3 font-display text-lg italic text-champagne/70">“{chapter.epigraph}”</p>
        ) : null}
      </div>

      {chapter.intro ? (
        <p className="mx-auto max-w-lg text-center text-sm leading-relaxed text-fog">{chapter.intro}</p>
      ) : null}

      {memories.length === 0 ? (
        <EmptyState
          eyebrow="Open chapter"
          title="Nothing here yet"
          body="This chapter has no memories yet — add one, and it lands on this page."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {memories.map((m) => (
            <Link key={m.id} href={`/memories/${m.id}`}>
              <Card className="group p-4 transition-all hover:border-champagne/30">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <Pill tone="gold">{m.kind}</Pill>
                  {m.status && m.status !== "verified" ? <Pill tone="ember">In progress</Pill> : null}
                </div>
                <h3 className="text-sm font-medium text-ink group-hover:text-champagne-soft">{m.title}</h3>
                <p className="mt-1 text-[11px] text-mist">{formatDate(m.date)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* prev / next navigation */}
      <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
        {prev ? (
          <Link
            href={`/story/${prev.id}`}
            className="group max-w-[45%]"
          >
            <span className="block text-[10px] uppercase tracking-[0.2em] text-mist">Previous</span>
            <span className="block truncate text-sm text-fog transition-colors group-hover:text-champagne-soft">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span className="max-w-[45%]" />
        )}
        {next ? (
          <Link href={`/story/${next.id}`} className="group max-w-[45%] text-right">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-mist">Next</span>
            <span className="block truncate text-sm text-fog transition-colors group-hover:text-champagne-soft">
              {next.title}
            </span>
          </Link>
        ) : (
          <span className="max-w-[45%]" />
        )}
      </div>
    </div>
  );
}