import { REFLECTION_QUESTIONS } from "@/lib/types";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill, EmptyState, Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { AddSheet } from "@/components/add-sheet";
import { submitReflection } from "@/lib/server/world";

export default async function ReflectionsPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const reflections = await store.listReflections(rel.id);
  const sorted = [...reflections].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const answered = new Set(reflections.map((r) => r.question));
  const fresh = REFLECTION_QUESTIONS.find((q) => !answered.has(q)) ?? REFLECTION_QUESTIONS[0];

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>Reflections</SectionLabel>
          <h1 className="font-display text-3xl font-medium text-ivory">Us Then / Us Now</h1>
          <p className="mt-1 max-w-lg text-sm text-fog">
            Small, recurring prompts that capture how your relationship is evolving. A living record of how you see each other — now, and in time.
          </p>
        </div>
        <AddSheet
          trigger={<Button size="sm">Answer a question</Button>}
          title="Us, right now"
          eyebrow="Reflections"
          submitLabel="Save it"
          action={submitReflection}
          fields={[
            {
              name: "question",
              label: "Question",
              required: true,
              defaultValue: fresh,
              placeholder: "Write your own question if you'd like",
              maxLength: 300,
            },
            { name: "answer", label: "Your answer", type: "textarea", rows: 4, required: true, placeholder: "Be honest. This is for us to look back on.", maxLength: 3000 },
          ]}
        />
      </div>

      {reflections.length === 0 ? (
        <EmptyState
          eyebrow="No reflections"
          title="A quiet question"
          body="Answer one question about how you see each other now. Come back in a month. See what changed."
        />
      ) : null}

      <div className="space-y-3">
        {sorted.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Pill tone="sage">{r.authorName}</Pill>
              <span className="text-[11px] text-mist">{formatDate(r.createdAt)}</span>
            </div>
            <p className="font-display text-sm italic text-champagne-soft">{r.question}</p>
            <p className="mt-2 text-sm text-ink">{r.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}