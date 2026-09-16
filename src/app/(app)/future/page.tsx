import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import Link from "next/link";
import { Card, SectionLabel, Pill, EmptyState, Button } from "@/components/ui";
import { AddSheet } from "@/components/add-sheet";
import { createGoal } from "@/lib/server/world";

const CATEGORY_LABELS: Record<string, string> = {
  love: "Love",
  career: "Career",
  home: "Home",
  travel: "Travel",
  finances: "Finances",
  family: "Family",
  adventures: "Adventures",
};

export default async function FuturePage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const goals = await store.listGoals(rel.id);
  const sorted = [...goals].sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>Forever &amp; Always</SectionLabel>
          <h1 className="font-display text-3xl font-medium text-ivory">Forever &amp; Always</h1>
          <p className="mt-1 max-w-lg text-sm text-fog">
            A place to hold dreams — small, big, concrete, impossible — and say them out loud together.
          </p>
        </div>
        <AddSheet
          trigger={<Button size="sm">Dream loudly</Button>}
          title="A dream for us"
          eyebrow="The Future"
          submitLabel="Plant the dream"
          action={createGoal}
          fields={[
            { name: "title", label: "The dream", required: true, placeholder: "e.g. Build our own house by the sea", maxLength: 220 },
            {
              name: "category",
              label: "What kind?",
              type: "select",
              options: Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l })),
            },
            { name: "description", label: "What it looks like", type: "textarea", rows: 3, placeholder: "Paint the picture so we can both see it", maxLength: 3000 },
            { name: "targetDate", label: "Target", type: "date", hint: "Optional — some dreams just happen" },
          ]}
        />
      </div>

      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        <FutureLink href="/future" label="Goals" active />
        <FutureLink href="/time-capsules" label="Time Capsules" />
        <FutureLink href="/anniversary" label="Anniversary" />
        <FutureLink href="/forever" label="Forever" />
      </div>

      {goals.length === 0 ? (
        <EmptyState
          eyebrow="Empty"
          title="The future is unwritten"
          body="Dream something together. Say it out loud. Make it real."
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((g) => (
          <Card key={g.id} className={`p-5 ${g.completed ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-2 mb-2">
              <Pill tone={g.completed ? "sage" : "gold"}>{CATEGORY_LABELS[g.category] ?? g.category}</Pill>
              {g.completed ? <Pill tone="sage">Done</Pill> : null}
            </div>
            <h3 className="text-sm font-medium text-ivory">{g.title}</h3>
            {g.description ? <p className="mt-1 text-xs text-fog">{g.description}</p> : null}
            {!g.completed && g.progress > 0 ? (
              <div className="mt-3 h-1 rounded-full bg-line">
                <div className="h-full rounded-full bg-champagne/60" style={{ width: `${Math.min(100, g.progress)}%` }} />
              </div>
            ) : null}
            {g.targetDate ? (
              <p className="mt-2 text-[11px] text-mist">
                Target: {new Date(g.targetDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}

function FutureLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  const cls = active
    ? "whitespace-nowrap rounded-full border border-champagne/40 bg-champagne-faint px-3.5 py-1.5 text-[12px] text-champagne-soft"
    : "whitespace-nowrap rounded-full border border-line-strong px-3.5 py-1.5 text-[12px] text-fog transition-colors hover:border-champagne/40 hover:text-champagne-soft";
  return <Link href={href} className={cls}>{label}</Link>;
}