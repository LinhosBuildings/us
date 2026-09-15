import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel } from "@/components/ui";
import { computeCounter } from "@/lib/relationship-counter";
import { RelationshipCounter } from "@/components/relationship-counter";

export default async function AnniversaryPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;

  const c = computeCounter(rel.startDate);
  const memories = await store.listMemories(rel.id);
  const thisYear = new Date().getFullYear();
  const yearMemories = memories.filter((m) => new Date(m.date).getFullYear() === thisYear);

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="text-center">
        <SectionLabel>Anniversary recap</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">This Year With Us</h1>
        <p className="mt-2 max-w-lg text-sm text-fog">
          {thisYear} — <span className="text-champagne">{yearMemories.length} memories</span> this year alone.
        </p>
      </div>

      <div className="mx-auto max-w-md">
        <RelationshipCounter startDate={rel.startDate} initial={c} />
      </div>

      <div className="mx-auto max-w-lg text-center">
        <p className="font-display text-lg text-fog">
          You&rsquo;ve been building this for <span className="text-champagne">{c.months} months and {c.days} days</span>.
        </p>
      </div>

      {/* top moments this year */}
      {yearMemories.length > 0 ? (
        <div className="space-y-3">
          <SectionLabel>Top moments this year</SectionLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {yearMemories.slice(0, 6).map((m) => (
              <Card key={m.id} className="p-4">
                <p className="text-sm font-medium text-ivory">{m.title}</p>
                <p className="mt-1 text-[11px] text-mist">{m.createdByName} · {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="mx-auto max-w-md p-6 text-center">
          <p className="text-sm text-fog">No memories from this year yet. Go make some.</p>
        </Card>
      )}
    </div>
  );
}