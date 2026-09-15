import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui";

export default async function MemoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) notFound();
  const memory = await store.getMemory(rel.id, id);
  if (!memory) notFound();

  const perspectives = await store.listPerspectives(rel.id, memory.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-24 md:pb-0">
      <div>
        <Link href="/memories" className="mb-2 inline-flex items-center gap-1 text-[12px] text-champagne hover:text-champagne-soft">
          ← Memories
        </Link>
        <SectionLabel>Memory</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">{memory.title}</h1>
      </div>

      {/* metadata */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="gold">{memory.kind}</Pill>
          {memory.mood ? <Pill>{memory.mood}</Pill> : null}
          {memory.visibility === "me-only" ? <Pill tone="ember">Private</Pill> : null}
          <span className="text-[11px] text-mist">{formatDate(memory.date)}</span>
          <span className="text-[11px] text-fog">by {memory.createdByName}</span>
          {memory.locationName ? <span className="text-[11px] text-sage">📍 {memory.locationName}</span> : null}
        </div>
        {memory.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {memory.tags.map((t) => (
              <span key={t} className="rounded-full bg-champagne-faint/30 px-2 py-0.5 font-mono text-[10px] text-champagne">
                #{t}
              </span>
            ))}
          </div>
        ) : null}
      </Card>

      {/* media */}
      {memory.media.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {memory.media.map((m) => (
            <Card key={m.id} className="overflow-hidden">
              {m.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : m.type === "video" ? (
                <div className="aspect-video flex items-center justify-center bg-panel/50 text-mist text-xs">Video</div>
              ) : (
                <div className="aspect-[4/3] flex items-center justify-center bg-panel/50 text-mist text-xs">Voice note</div>
              )}
            </Card>
          ))}
        </div>
      ) : null}

      {/* description */}
      {memory.description ? (
        <Card className="p-6">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{memory.description}</p>
        </Card>
      ) : null}

      {/* never told */}
      {memory.neverTold ? (
        <Card className="border-champagne/20 bg-champagne-faint/10 p-6">
          <SectionLabel className="mb-2">What I never told you</SectionLabel>
          <p className="whitespace-pre-wrap text-sm italic leading-relaxed text-ivory">{memory.neverTold}</p>
        </Card>
      ) : null}

      {/* song */}
      {memory.song ? (
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-champagne-faint/30 text-champagne">♪</div>
          <div>
            <p className="text-sm font-medium text-ink">{memory.song.title}</p>
            <p className="text-[11px] text-mist">{memory.song.artist}</p>
          </div>
        </Card>
      ) : null}

      {/* perspectives */}
      <div className="space-y-3">
        <SectionLabel>Perspectives</SectionLabel>
        {perspectives.length === 0 ? (
          <p className="text-xs text-mist">No one&rsquo;s weighed in yet. A different perspective, a memory of your own.</p>
        ) : (
          perspectives.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Pill tone="sage">{p.authorName}</Pill>
                <span className="text-[11px] text-mist">{formatDate(p.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{p.text}</p>
            </Card>
          ))
        )}
      </div>

      {/* milestone info */}
      {memory.milestone ? (
        <Card className="p-4">
          <SectionLabel className="mb-1">Milestone</SectionLabel>
          <p className="text-sm text-ivory">{memory.milestone.label}</p>
        </Card>
      ) : null}
    </div>
  );
}