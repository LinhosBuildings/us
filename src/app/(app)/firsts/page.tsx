import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill, EmptyState, Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { AddSheet } from "@/components/add-sheet";
import { createFirst } from "@/lib/server/expressions";

export default async function FirstsPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const firsts = await store.listFirsts(rel.id);
  const sorted = [...firsts].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>Firsts</SectionLabel>
          <h1 className="font-display text-3xl font-medium text-ivory">Firsts</h1>
          <p className="mt-1 max-w-lg text-sm text-fog">
            The line of firsts — that threshold moment when everything changed. Mark the line.
          </p>
        </div>
        <AddSheet
          trigger={<Button size="sm">Mark a first</Button>}
          title="A first"
          eyebrow="Firsts"
          submitLabel="Mark it"
          action={createFirst}
          fields={[
            { name: "title", label: "The first…", required: true, placeholder: "First time we said 'I love you'", maxLength: 200 },
            { name: "date", label: "When", type: "date" },
            { name: "description", label: "What happened", type: "textarea", rows: 3, placeholder: "The moment itself — where you were, what changed.", maxLength: 2000 },
          ]}
        />
      </div>

      {firsts.length === 0 ? (
        <EmptyState
          eyebrow="Empty"
          title="Your firsts are waiting"
          body="First date. First fight. First time you knew. Each one is a line on the timeline."
        />
      ) : null}

      <div className="space-y-3">
        {sorted.map((f) => (
          <Card key={f.id} className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-champagne-faint/40 font-display text-sm text-champagne">
                ★
              </div>
              <div>
                <p className="text-sm font-medium text-ivory">{f.title}</p>
                {f.description ? <p className="mt-0.5 text-xs text-fog">{f.description}</p> : null}
              </div>
            </div>
            {f.date ? (
              <p className="mt-2 ml-11 text-[11px] text-mist">{formatDate(f.date)}</p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}