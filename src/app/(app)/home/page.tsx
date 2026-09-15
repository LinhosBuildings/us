import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { computeCounter } from "@/lib/relationship-counter";
import { RelationshipCounter } from "@/components/relationship-counter";
import { SectionLabel, EmptyState } from "@/components/ui";

function fmtDay(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const SHORTCUT = (s: string | null | undefined, n = 90) => (s && s.length > n ? s.slice(0, n).trimEnd() + "…" : s ?? "");

export default async function HomePage() {
  const user = await requireUser();
  const store = await getStore();
  const rel = await store.getRelationshipForUser(user.id);
  if (!rel) return null;

  const counter = computeCounter(rel.startDate);

  const [
    chapters,
    memories,
    letters,
    openWhen,
    confessions,
    dictionary,
    reflections,
    firsts,
    places,
    littleThings,
    soundtrack,
    goals,
    capsules,
    survived,
    messages,
  ] = await Promise.all([
    store.listChapters(rel.id),
    store.listMemories(rel.id),
    store.listLetters(rel.id),
    store.listOpenWhen(rel.id),
    store.listConfessions(rel.id),
    store.listDictionary(rel.id),
    store.listReflections(rel.id),
    store.listFirsts(rel.id),
    store.listPlaces(rel.id),
    store.listLittleThings(rel.id),
    store.listSoundtrack(rel.id),
    store.listGoals(rel.id),
    store.listTimeCapsules(rel.id),
    store.listSurvived(rel.id),
    store.listMessages(rel.id),
  ]);

  const ordered = [...chapters].sort((a, b) => a.order - b.order);
  const recent = [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  const latestMessage = messages[messages.length - 1];
  const openSurvived = survived.filter((s) => !s.resolved).length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex flex-col items-center pt-8 pb-12 text-center md:pt-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-champagne/70">Our Universe</p>
        <h1 className="mt-4 font-display text-5xl font-medium leading-tight text-ivory md:text-6xl">
          <span className="text-gradient-gold">{rel.name}</span>
        </h1>
        {rel.description ? <p className="mx-auto mt-4 max-w-md text-base text-fog">{rel.description}</p> : null}

        <div className="mt-6 rounded-2xl border border-line bg-panel/40 px-6 py-5">
          <RelationshipCounter startDate={rel.startDate} initial={counter} />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {rel.members.map((m) => (
            <span key={m.id} className="rounded-full border border-line px-3 py-1 text-[12px] text-ink">
              {m.name}
              {m.isOwner ? <span className="ml-1.5 font-mono text-[9px] uppercase text-champagne/60">keeper</span> : null}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] text-mist">
          <span>{memories.length} memories</span>
          <span aria-hidden>·</span>
          <span>{letters.length} letters</span>
          <span aria-hidden>·</span>
          <span>{capsules.length} capsules</span>
          <span aria-hidden>·</span>
          <span className="text-champagne/80">code {rel.code}</span>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#story"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-champagne px-6 text-sm font-medium text-midnight transition-colors hover:bg-champagne-soft"
          >
            Begin our story <span aria-hidden>↓</span>
          </a>
          <Link
            href="/messages"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-6 text-sm text-ink transition-colors hover:border-champagne/50 hover:text-champagne-soft"
          >
            Open the chat
          </Link>
        </div>
      </section>

      {/* ── Our story, chapter by chapter ───────────────────── */}
      <section id="story" className="scroll-mt-24 space-y-10 py-8">
        <div className="text-center">
          <SectionLabel>Our Story</SectionLabel>
          <h2 className="font-display text-3xl font-medium text-ivory">Chapter by chapter</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-fog">The whole manuscript, scrolling like a real web. Start anywhere.</p>
        </div>

        <div className="space-y-8">
          {ordered.map((ch, i) => {
            const chapterMemories = memories
              .filter((m) => m.chapterId === ch.id)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return (
              <article key={ch.id} className="relative pl-6 md:pl-8">
                {i < ordered.length - 1 ? (
                  <span aria-hidden className="absolute left-[5px] top-8 bottom-0 w-px bg-gradient-to-b from-champagne/40 to-transparent" />
                ) : null}
                <span aria-hidden className="absolute left-0 top-2.5 h-[11px] w-[11px] rounded-full border border-champagne/60 bg-midnight" />

                <div className="space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-champagne/70">{ch.code}</p>
                  <h3 className="font-display text-2xl font-medium text-ivory">{ch.title}</h3>
                  {ch.epigraph ? <p className="font-display text-base italic text-champagne/60">“{ch.epigraph}”</p> : null}
                  {ch.intro ? <p className="max-w-lg text-sm leading-relaxed text-fog">{ch.intro}</p> : null}

                  {chapterMemories.length === 0 ? (
                    <p className="text-xs text-mist">No pages written in this chapter yet — they will be.</p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      {chapterMemories.map((m) => (
                        <Link key={m.id} href={`/memories/${m.id}`} className="block">
                          <div className="rounded-xl border border-line bg-panel/40 p-4 transition-colors hover:border-champagne/30">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-champagne/70">{m.kind}</span>
                              {m.status && m.status !== "verified" ? (
                                <span className="rounded-full border border-ember/30 bg-ember/10 px-2 py-0.5 font-mono text-[9.5px] uppercase text-ember">
                                  in progress
                                </span>
                              ) : null}
                              <span className="ml-auto text-[11px] text-mist">{fmtDay(m.date)}</span>
                            </div>
                            <p className="mt-1 text-sm font-medium text-ivory">{m.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-fog">{SHORTCUT(m.description, 160)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/story" className="rounded-full border border-line-strong px-5 py-2 text-[13px] text-ink transition-colors hover:border-champagne/50 hover:text-champagne-soft">
            Read the whole story →
          </Link>
          <Link href="/survived" className="rounded-full border border-line-strong px-5 py-2 text-[13px] text-ink transition-colors hover:border-champagne/50 hover:text-champagne-soft">
            What we've been through{openSurvived > 0 ? ` · ${openSurvived} still open` : ""} →
          </Link>
        </div>
      </section>

      {/* ── Recent memories ─────────────────────────────────── */}
      <section className="space-y-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <SectionLabel>Memories</SectionLabel>
            <h2 className="font-display text-3xl font-medium text-ivory">Recent pages</h2>
          </div>
          <Link href="/memories" className="shrink-0 text-[13px] text-champagne hover:text-champagne-soft">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            eyebrow="Empty page"
            title="No memories yet"
            body="Add the first one — a photo, a story, a moment worth keeping."
            action={<Link href="/memories"><span className="rounded-full bg-champagne px-5 py-2 text-[13px] font-medium text-midnight">Add a memory</span></Link>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map((m) => (
              <Link key={m.id} href={`/memories/${m.id}`}>
                <div className="group h-full rounded-xl border border-line bg-panel/40 p-4 transition-colors hover:border-champagne/30">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-champagne/70">{m.kind}</span>
                    <span className="text-[11px] text-mist">{fmtDay(m.date)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ivory transition-colors group-hover:text-champagne-soft">{m.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-fog">{SHORTCUT(m.description, 120)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── The chat ─────────────────────────────────────────── */}
      <section className="space-y-4 py-10">
        <div className="rounded-2xl border border-champagne/20 bg-champagne-faint p-6 md:p-7">
          <SectionLabel>Chat</SectionLabel>
          <h2 className="mt-1 font-display text-3xl font-medium text-ivory">Us, talking</h2>
          {latestMessage ? (
            <p className="mt-2 text-sm text-fog">
              <span className="font-medium text-champagne-soft">{latestMessage.authorName}:</span> {SHORTCUT(latestMessage.body, 120)}
            </p>
          ) : (
            <p className="mt-2 max-w-md text-sm text-fog">The running conversation between just the two of you. It starts when one of you says something.</p>
          )}
          <Link
            href="/messages"
            className="mt-5 inline-flex h-10 items-center rounded-full bg-champagne px-6 text-sm font-medium text-midnight transition-colors hover:bg-champagne-soft"
          >
            Open the chat
          </Link>
        </div>
      </section>

      {/* ── The corners of the universe ─────────────────────── */}
      <section className="space-y-6 py-10">
        <div className="text-center">
          <SectionLabel>Around the universe</SectionLabel>
          <h2 className="font-display text-3xl font-medium text-ivory">Three more corners</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <CornerCard
            href="/words"
            title="Our Words"
            body="Letters, open-when, confessions, dictionary, reflections — everything either of you has written."
            meta={`${letters.length} letters · ${confessions.length} confessions · ${dictionary.length} words`}
          />
          <CornerCard
            href="/world"
            title="Our World"
            body="Firsts, places we've gone, little things, and the songs that mean us."
            meta={`${firsts.length} firsts · ${places.length} places · ${soundtrack.length} songs`}
          />
          <CornerCard
            href="/future"
            title="The Future"
            body="Goals we're growing toward, time capsules, anniversaries, and forever."
            meta={`${goals.length} goals · ${capsules.length} capsules`}
          />
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center">
        <p className="font-display text-lg text-fog">
          {counter.years} year{counter.years === 1 ? "" : "s"}, {counter.months} months, {counter.days} days of us.
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-mist">All of it yours. All of it true.</p>
      </footer>
    </div>
  );
}

function CornerCard({ href, title, body, meta }: { href: string; title: string; body: string; meta: string }) {
  return (
    <Link href={href} className="flex flex-col rounded-xl border border-line bg-panel/40 p-5 transition-colors hover:border-champagne/30">
      <h3 className="font-display text-xl font-medium text-ivory group-hover:text-champagne-soft">{title}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-fog">{body}</p>
      <p className="mt-3 font-mono text-[9.5px] uppercase tracking-wider text-champagne/70">{meta}</p>
    </Link>
  );
}