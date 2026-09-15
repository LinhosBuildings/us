import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel, Pill, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function OpenWhenPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;
  const entries = await store.listOpenWhen(rel.id);
  const sorted = [...entries].sort((a, b) => (a.lockBehavior === "permanent" ? 1 : 0) - (b.lockBehavior === "permanent" ? 1 : 0));

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <div>
        <SectionLabel>Open When…</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory">Open When</h1>
        <p className="mt-1 max-w-lg text-sm text-fog">
          A collection of sealed and unsealed letters for moments that haven&rsquo;t happened yet — or have.
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          eyebrow="No sealed letters"
          title="The first one is yours to write"
          body="Open When letters are gifts from the present to the future."
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((e) => (
          <Card
            key={e.id}
            className={`group p-5 transition-all ${e.locked ? "opacity-60" : "hover:border-champagne/30"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Pill tone={e.locked ? "ember" : "gold"}>{e.locked ? "Sealed" : "Open"}</Pill>
              <Pill>{e.lockBehavior}</Pill>
            </div>
            <h3 className="text-sm font-medium text-ink group-hover:text-champagne-soft">{e.title}</h3>
            {!e.locked ? (
              <p className="mt-1 line-clamp-2 text-xs text-fog">{e.body.slice(0, 150)}</p>
            ) : (
              <p className="mt-1 text-xs text-mist italic">This letter is sealed.</p>
            )}
            <div className="mt-2 text-[11px] text-mist">{e.authorName} · {formatDate(e.createdAt)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}