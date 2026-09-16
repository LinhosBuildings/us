import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, EmptyState, Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { AddSheet } from "@/components/add-sheet";
import { createLittleThing } from "@/lib/server/expressions";

export default async function LittleThingsPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const things = await store.listLittleThings(rel.id);
  const sorted = [...things].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>Little Things</SectionLabel>
          <h1 className="font-display text-3xl font-medium text-ivory">Little Things</h1>
          <p className="mt-1 max-w-lg text-sm text-fog">
            The tiny moments that say more than big gestures ever could. The way you take your coffee. The look that means everything.
          </p>
        </div>
        <AddSheet
          trigger={<Button size="sm">Note one</Button>}
          title="A little thing"
          eyebrow="Little Things"
          submitLabel="Keep it"
          media
          action={createLittleThing}
          fields={[
            { name: "what", label: "What happened", type: "textarea", rows: 2, required: true, placeholder: "You texted me the second you landed. Without fail.", maxLength: 1200 },
            { name: "why", label: "Why it mattered", placeholder: "The quiet reason it stayed with me", maxLength: 1200 },
            { name: "date", label: "When", type: "date" },
          ]}
        />
      </div>

      {things.length === 0 ? (
        <EmptyState
          eyebrow="Empty"
          title="No little things yet"
          body="Start noticing the small. They were always the biggest."
        />
      ) : null}

      <div className="space-y-3">
        {sorted.map((t) => (
          <Card key={t.id} className="p-5">
            <p className="text-sm font-medium text-ivory">{t.what}</p>
            {t.why ? <p className="mt-1 text-xs text-fog italic">{t.why}</p> : null}
            <div className="mt-2 flex items-center gap-2 text-[11px] text-mist">
              <span>{t.authorName}</span>
              {t.date ? <span>{formatDate(t.date)}</span> : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}