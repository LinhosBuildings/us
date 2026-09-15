import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function WorldPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const places = await store.listPlaces(rel.id);
  const sorted = [...places].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <SectionLabel>Our World</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">Our World</h1>
        <p className="mt-1 max-w-lg text-sm text-fog">
          A map of your shared world — places, stories, the geography of your relationship.
        </p>
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