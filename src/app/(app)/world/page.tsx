import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import Link from "next/link";
import { Card, SectionLabel, Pill, EmptyState, Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { AddSheet } from "@/components/add-sheet";
import { createPlace } from "@/lib/server/world";

export default async function WorldPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const places = await store.listPlaces(rel.id);
  const sorted = [...places].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>Our Planet</SectionLabel>
          <h1 className="font-display text-3xl font-medium text-ivory">Our Planet</h1>
          <p className="mt-1 max-w-lg text-sm text-fog">
            A map of your shared world — places, stories, the geography of your relationship.
          </p>
        </div>
        <AddSheet
          trigger={<Button size="sm">Drop a pin</Button>}
          title="A place of ours"
          eyebrow="Our World"
          submitLabel="Save the place"
          action={createPlace}
          fields={[
            { name: "name", label: "Place", required: true, placeholder: "e.g. The bench at Aberdeen Beach", maxLength: 160 },
            { name: "latitude", label: "Latitude", required: true, placeholder: "e.g. 6.5074", hint: "Find it on Google Maps and copy the numbers" },
            { name: "longitude", label: "Longitude", required: true, placeholder: "e.g. 3.3697" },
            { name: "date", label: "When", type: "date" },
            { name: "story", label: "Why this place", type: "textarea", rows: 3, placeholder: "The story that lives here", maxLength: 3000 },
          ]}
        />
      </div>

      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        <CornerLink href="/world" label="Places" active />
        <CornerLink href="/firsts" label="Firsts" />
        <CornerLink href="/little-things" label="Little Things" />
        <CornerLink href="/soundtrack" label="Soundtrack" />
      </div>

      {places.length === 0 ? (
        <EmptyState
          eyebrow="Empty map"
          title="Your world is waiting"
          body="The cafe where you first met. The street you always walk. Every place has a story."
        />
      ) : null}

      {/* Map placeholder */}
      <div className="h-64 rounded-2xl border border-line bg-panel/30 flex items-center justify-center text-mist text-sm">
        Map view (connect map provider in prod)
      </div>

      {/* Place cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-champagne">📍</span>
              <h3 className="text-sm font-medium text-ivory">{p.name}</h3>
            </div>
            {p.story ? <p className="text-xs text-fog">{p.story}</p> : null}
            {p.date ? <p className="mt-2 text-[11px] text-mist">{formatDate(p.date)}</p> : null}
            <p className="mt-1 font-mono text-[10px] text-mist/60">{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CornerLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  const cls = active
    ? "whitespace-nowrap rounded-full border border-champagne/40 bg-champagne-faint px-3.5 py-1.5 text-[12px] text-champagne-soft"
    : "whitespace-nowrap rounded-full border border-line-strong px-3.5 py-1.5 text-[12px] text-fog transition-colors hover:border-champagne/40 hover:text-champagne-soft";
  return <Link href={href} className={cls}>{label}</Link>;
}