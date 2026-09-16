import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { SectionLabel } from "@/components/ui";

export default async function WordsPage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;

  const [letters, openWhen, confessions, dictionary, reflections] = await Promise.all([
    store.listLetters(rel.id),
    store.listOpenWhen(rel.id),
    store.listConfessions(rel.id),
    store.listDictionary(rel.id),
    store.listReflections(rel.id),
  ]);

  const corners = [
    {
      href: "/letters",
      title: "Letters",
      body: "The words you wrote when you had to say it properly.",
      meta: `${letters.length} letter${letters.length === 1 ? "" : "s"}`,
    },
    {
      href: "/open-when",
      title: "Open When…",
      body: "Sealed letters for moments that haven't happened yet — or have.",
      meta: `${openWhen.length} sealed or open`,
    },
    {
      href: "/confessions",
      title: "Confessions",
      body: "The things hard to say out loud — parked here, safely.",
      meta: `${confessions.length} confession${confessions.length === 1 ? "" : "s"}`,
    },
    {
      href: "/dictionary",
      title: "Dictionary",
      body: "The words only we understand.",
      meta: `${dictionary.length} word${dictionary.length === 1 ? "" : "s"}`,
    },
    {
      href: "/reflections",
      title: "Reflections",
      body: "The questions we keep asking each other — and the answers.",
      meta: `${reflections.length} reflection${reflections.length === 1 ? "" : "s"}`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="text-center">
        <SectionLabel>Words of Us</SectionLabel>
        <h1 className="font-display text-4xl font-medium text-ivory">Everything we&rsquo;ve written</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-fog">
          Letters, open-when, confessions, the words only we use, and the questions we keep asking each other.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {corners.map((c) => (
          <Link key={c.href} href={c.href} className="group flex flex-col rounded-xl border border-line bg-panel/40 p-5 transition-colors hover:border-champagne/30">
            <h2 className="font-display text-2xl font-medium text-ivory transition-colors group-hover:text-champagne-soft">{c.title}</h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-fog">{c.body}</p>
            <p className="mt-3 font-mono text-[9.5px] uppercase tracking-wider text-champagne/70">{c.meta} · open →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}