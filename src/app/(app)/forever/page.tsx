import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { Card, SectionLabel } from "@/components/ui";
import { computeCounter } from "@/lib/relationship-counter";

export default async function ForeverPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;

  const c = computeCounter(rel.startDate);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 px-6 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/[0.04] blur-[120px]" />

      <div className="relative z-10 space-y-4">
        <SectionLabel>Forever</SectionLabel>
        <h1 className="font-display text-5xl font-medium text-gradient-gold">
          Forever
        </h1>
        <p className="mx-auto max-w-md text-lg font-light text-fog">
          {c.years} years, {c.months} months, {c.days} days
        </p>
        <p className="mx-auto max-w-sm text-sm italic text-mist">
          &ldquo;A private universe. For two people. Not the algorithm&rsquo;s. Not the feed&rsquo;s. Yours.&rdquo;
        </p>
      </div>
    </div>
  );
}