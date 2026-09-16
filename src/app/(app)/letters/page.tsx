import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, EmptyState, Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { AddSheet } from "@/components/add-sheet";
import { createLetter } from "@/lib/server/expressions";
import type { LetterCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<LetterCategory, string> = {
  "to-you": "To You",
  "what-i-love": "What I Love About You",
  "never-forget": "Don't Ever Forget This",
  "thank-you": "Thank You",
  "im-sorry": "I'm Sorry",
  "future-wife": "To My Future Wife",
  "future-husband": "To My Future Husband",
  "future-family": "To Our Future Family",
  "when-were-old": "When We're Old",
};

export default async function LettersPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const letters = await store.listLetters(rel.id);
  const sorted = [...letters].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const byCategory = new Map<LetterCategory, typeof sorted>();
  for (const l of sorted) {
    if (!byCategory.has(l.category)) byCategory.set(l.category, []);
    byCategory.get(l.category)!.push(l);
  }

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>Letters</SectionLabel>
          <h1 className="font-display text-3xl font-medium text-ivory">Letters</h1>
          <p className="mt-1 max-w-lg text-sm text-fog">Handwritten words in a private place. Say the things the algorithm would never let you say.</p>
        </div>
        <AddSheet
          trigger={<Button size="sm">Write a letter</Button>}
          title="Write a letter"
          eyebrow="Letters"
          submitLabel="Seal the letter"
          media
          action={createLetter}
          fields={[
            { name: "title", label: "Title", required: true, placeholder: "A line that says it before they read it", maxLength: 220 },
            {
              name: "category",
              label: "This is a letter for…",
              type: "select",
              options: (Object.keys(CATEGORY_LABELS) as LetterCategory[]).map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
            },
            { name: "body", label: "The letter", type: "textarea", rows: 7, required: true, placeholder: "Start with whatever's true.", maxLength: 20000 },
          ]}
        />
      </div>

      {letters.length === 0 ? (
        <EmptyState
          eyebrow="Empty page"
          title="No letters yet"
          body="Write one. It doesn't need to be perfect. It needs to be true."
        />
      ) : null}

      {[...byCategory.entries()].map(([cat, items]) => (
        <div key={cat} className="space-y-3">
          <SectionLabel>{CATEGORY_LABELS[cat]}</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((l) => (
              <Card key={l.id} className="group p-5 transition-all hover:border-champagne/30">
                <h3 className="text-sm font-medium text-ink group-hover:text-champagne-soft">{l.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-fog">{l.body.slice(0, 150)}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-mist">
                  <span>{l.authorName}</span>
                  <span>{formatDate(l.createdAt)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}