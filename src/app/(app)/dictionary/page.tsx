import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill, EmptyState, Button } from "@/components/ui";
import { AddSheet } from "@/components/add-sheet";
import { createDictionaryEntry } from "@/lib/server/expressions";

export default async function DictionaryPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const entries = await store.listDictionary(rel.id);
  const sorted = [...entries].sort((a, b) => a.word.localeCompare(b.word));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>Our Dictionary</SectionLabel>
          <h1 className="font-display text-3xl font-medium text-ivory">Our Dictionary</h1>
          <p className="mt-1 max-w-lg text-sm text-fog">
            The private language you built together. Words only the two of you understand.
          </p>
        </div>
        <AddSheet
          trigger={<Button size="sm">Invent a word</Button>}
          title="A new word"
          eyebrow="Our Dictionary"
          submitLabel="Add the word"
          action={createDictionaryEntry}
          fields={[
            { name: "word", label: "The word", required: true, placeholder: "e.g. MLTAGOT", maxLength: 80 },
            { name: "meaning", label: "What it means", type: "textarea", rows: 2, required: true, placeholder: "Only we know what this means…", maxLength: 1000 },
            { name: "origin", label: "Where it came from", type: "textarea", rows: 2, placeholder: "The story behind the word", maxLength: 2000 },
            { name: "example", label: "Used in a sentence", type: "textarea", rows: 2, placeholder: "e.g. 'He just MLTAGOT me.'", maxLength: 2000 },
            { name: "usedSince", label: "Used since", placeholder: "e.g. March 2025", maxLength: 20 },
          ]}
        />
      </div>

      {entries.length === 0 ? (
        <EmptyState
          eyebrow="Empty"
          title="Your private dictionary is waiting"
          body="Make up a word. Say what only you two know."
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((d) => (
          <Card key={d.id} className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display text-xl font-medium text-champagne-soft">{d.word}</span>
              {d.usedSince ? <Pill>{d.usedSince}</Pill> : null}
            </div>
            <p className="text-sm text-ink">{d.meaning}</p>
            {d.origin ? <p className="mt-1 text-xs italic text-fog">Origin: {d.origin}</p> : null}
            {d.example ? <p className="mt-1 text-xs text-mist">Example: {d.example}</p> : null}
            <p className="mt-2 text-[11px] text-mist">Invented by {d.inventorName ?? "us"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}