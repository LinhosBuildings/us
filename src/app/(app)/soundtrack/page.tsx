import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function SoundtrackPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const songs = await store.listSoundtrack(rel.id);
  const sorted = [...songs].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <SectionLabel>The Soundtrack</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">The Soundtrack of Us</h1>
        <p className="mt-1 max-w-lg text-sm text-fog">
          The songs that map your relationship — what you heard, what you felt, what you sang together.
        </p>
      </div>

      {songs.length === 0 ? (
        <EmptyState
          eyebrow="Silent"
          title="Your soundtrack is empty"
          body="Every couple has a soundtrack. What's yours?"
        />
      ) : null}

      <div className="space-y-3">
        {sorted.map((s) => (
          <Card key={s.id} className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-champagne-faint/30 font-display text-lg text-champagne">
              ♪
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ivory">{s.song.title}</p>
              <p className="truncate text-[11px] text-mist">{s.song.artist}</p>
              {s.why ? <p className="mt-1 line-clamp-2 text-xs text-fog italic">{s.why}</p> : null}
              {s.date ? <p className="mt-1 text-[11px] text-mist">{formatDate(s.date)}</p> : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}