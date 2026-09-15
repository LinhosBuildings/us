import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { RelationshipCounter } from "@/components/relationship-counter";
import { Constellation } from "@/components/constellation";
import { Card, SectionLabel, Button, Pill } from "@/components/ui";
import { formatDate, pluralize } from "@/lib/utils";

const EXPLORE = [
  { href: "/memories", label: "Explore memories", count: true, color: "gold" as const },
  { href: "/story", label: "Our Story", count: false, color: "neutral" as const },
  { href: "/letters", label: "Letters", count: true, color: "neutral" as const },
  { href: "/world", label: "Our World", count: true, color: "sage" as const },
  { href: "/dictionary", label: "Our Dictionary", count: true, color: "neutral" as const },
  { href: "/firsts", label: "Firsts", count: true, color: "neutral" as const },
  { href: "/little-things", label: "Little Things", count: true, color: "soft" as const },
  { href: "/future", label: "The Future Tree", count: false, color: "ember" as const },
  { href: "/time-capsules", label: "Time Capsules", count: false, color: "neutral" as const },
  { href: "/reflections", label: "Reflections", count: false, color: "neutral" as const },
  { href: "/survived", label: "What We Survived", count: false, color: "neutral" as const },
];

export default async function HomePage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  const memories = rel ? await store.listMemories(rel.id) : [];
  const goals = rel ? await store.listGoals(rel.id) : [];
  const capsules = rel ? await store.listTimeCapsules(rel.id) : [];
  const partner = rel?.members.find((m) => m.id !== user.id);

  return (
    <div className="space-y-10 pb-24 md:pb-0">
      {/* header / counter */}
      <div className="space-y-6 text-center">
        <SectionLabel>Our Universe</SectionLabel>
        <h1 className="font-display text-3xl font-medium text-ivory md:text-4xl">
          <span className="text-gradient-gold">{rel?.name ?? "Our Universe"}</span>
        </h1>
        {rel?.description ? <p className="mx-auto max-w-md text-sm text-fog">{rel.description}</p> : null}

        <Suspense fallback={<div className="h-28" />}>
          <RelationshipCounter startDate={rel!.startDate} />
        </Suspense>

        <p className="font-display text-lg text-fog">
          {pluralize(memories.length, "memory")} {goals.length ? `· ${goals.length} dreams` : ""} {capsules.length ? `· ${capsules.length} capsules` : ""}
        </p>
      </div>

      {/* constellation */}
      {memories.length > 0 ? (
        <Suspense fallback={<div className="h-72 rounded-2xl border border-line bg-panel/30" />}>
          <Constellation memories={memories} />
        </Suspense>
      ) : null}

      {/* explore nav */}
      <div className="space-y-4">
        <SectionLabel>Explore</SectionLabel>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EXPLORE.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="group flex items-center justify-between px-5 py-4 transition-all hover:border-champagne/30 hover:bg-panel/80">
                <span className="text-sm text-ink transition-colors group-hover:text-champagne-soft">{item.label}</span>
                {item.count ? <Pill tone={item.color}>→</Pill> : <Pill>→</Pill>}
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* relationship info */}
      <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Since</p>
          <p className="font-display text-lg text-ivory">{formatDate(rel?.startDate ?? "")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {rel?.members.map((m) => (
            <Pill key={m.id} tone={m.id === user.id ? "gold" : "sage"}>
              {m.name}
            </Pill>
          ))}
          {rel?.secretCode ? <Pill tone="soft">secret · {rel.secretCode}</Pill> : null}
        </div>
      </Card>

      <div className="h-8 md:h-0" />
    </div>
  );
}