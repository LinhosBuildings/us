import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function TimeCapsulesPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const capsules = await store.listTimeCapsules(rel.id);
  const sorted = [...capsules].sort((a, b) => a.unlockAt.localeCompare(b.unlockAt));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <SectionLabel>Time Capsules</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">Time Capsules</h1>
        <p className="mt-1 max-w-lg text-sm text-fog">
          Letters from the present to the future. You seal them today. You open them on a date, or when you&rsquo;re ready.
        </p>
      </div>

      {capsules.length === 0 ? (
        <EmptyState
          eyebrow="Empty"
          title="No time capsules yet"
          body="Write something to your future selves. Seal it. Wait."
        />
      ) : null}

      <div className="space-y-3">
        {sorted.map((c) => (
          <Card key={c.id} className={`p-5 ${c.status === "sealed" ? "border-champagne/10" : "border-sage/30"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Pill tone={c.status === "sealed" ? "ember" : "sage"}>{c.status === "sealed" ? "Sealed" : "Opened"}</Pill>
              <Pill>{formatDate(c.unlockAt)}</Pill>
            </div>
            <h3 className="text-sm font-medium text-ivory">{c.title}</h3>
            {c.note ? <p className="mt-1 line-clamp-2 text-xs text-fog">{c.note}</p> : null}
            {c.questions && c.questions.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {c.questions.map((q, i) => (
                  <span key={i} className="rounded-full bg-champagne-faint/20 px-2 py-0.5 text-[10px] text-champagne">
                    {q}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="mt-2 text-[11px] text-mist">Sealed {formatDate(c.createdAt)} · Media: {c.media.length} items</p>
          </Card>
        ))}
      </div>
    </div>
  );
}