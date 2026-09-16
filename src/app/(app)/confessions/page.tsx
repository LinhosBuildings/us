import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill, EmptyState, Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { AddSheet } from "@/components/add-sheet";
import { createConfession } from "@/lib/server/expressions";

export default async function ConfessionsPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const confessions = await store.listConfessions(rel.id);
  const sorted = [...confessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>Confessions</SectionLabel>
          <h1 className="font-display text-3xl font-medium text-ivory">Confessions</h1>
          <p className="mt-1 max-w-lg text-sm text-fog">
            The things you&rsquo;re not sure you can say — whispered into a safe place.
          </p>
        </div>
        <AddSheet
          trigger={<Button size="sm">Whisper one</Button>}
          title="A confession"
          eyebrow="Confessions"
          submitLabel="Confess"
          media
          action={createConfession}
          fields={[
            { name: "text", label: "What you can't say", type: "textarea", rows: 4, required: true, placeholder: "Say it here. It's safe with us.", maxLength: 5000 },
            {
              name: "visibility",
              label: "Who sees it?",
              type: "select",
              options: [
                { value: "private", label: "Private — just written, stays out of the open" },
                { value: "revealed", label: "Revealed — both of us can read it" },
                { value: "reveal-on", label: "Reveal on a special date" },
              ],
            },
            { name: "revealAt", label: "Reveal date", type: "date", hint: "Only for 'Reveal on a special date'" },
          ]}
        />
      </div>

      {confessions.length === 0 ? (
        <EmptyState
          eyebrow="No confessions"
          title="Nothing whispered yet"
          body="Confessions are private by default. They can be revealed on a date, by interaction, or never."
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Pill tone={c.visibility === "revealed" ? "gold" : "ember"}>{c.visibility}</Pill>
              <span className="text-[11px] text-mist">{c.authorName}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{c.text}</p>
            {c.revealAt ? (
              <p className="mt-2 text-[11px] text-mist">Reveals {formatDate(c.revealAt)}</p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}