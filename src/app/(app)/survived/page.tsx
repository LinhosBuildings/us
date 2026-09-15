import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function SurvivedPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const entries = await store.listSurvived(rel.id);
  const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <SectionLabel>What We Survived</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">What We Survived</h1>
        <p className="mt-1 max-w-lg text-sm text-fog">
          You made it through. Mark the scar. Write what happened, what you felt, what you learned — so future you remembers the weight you carried and kept going.
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          eyebrow="Empty"
          title="Nothing here yet"
          body="When the storm passes — and it will — mark what you survived. Together."
        />
      ) : null}

      <div className="space-y-4">
        {sorted.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Pill tone={s.resolved ? "sage" : "ember"}>{s.resolved ? "Resolved" : "Unresolved"}</Pill>
              <span className="text-[11px] text-mist">{formatDate(s.createdAt)}</span>
            </div>
            <h3 className="text-sm font-medium text-ivory">{s.whatHappened}</h3>
            {s.howIFelt ? (
              <p className="mt-2 text-xs italic text-fog">How I felt: {s.howIFelt}</p>
            ) : null}
            {s.whatILearned ? (
              <p className="mt-1 text-xs text-sage">What I learned: {s.whatILearned}</p>
            ) : null}
            {s.howWeResolved ? (
              <p className="mt-1 text-xs text-champagne">How we resolved it: {s.howWeResolved}</p>
            ) : null}
            {s.doNotForget ? (
              <p className="mt-2 text-[11px] text-mist italic">Do not forget: {s.doNotForget}</p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}