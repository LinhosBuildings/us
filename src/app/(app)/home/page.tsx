import Link from "next/link";
import { requireUser } from "@/lib/server/session";
import { getStore } from "@/lib/data/contracts";
import { computeCounter } from "@/lib/relationship-counter";
import { RelationshipCounter } from "@/components/relationship-counter";
import { Lovefield } from "@/components/lovefield";
import { LoveDuo } from "@/components/love-duo";
import { Constellation } from "@/components/constellation";
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
    <div className="relative mx-auto w-full max-w-3xl">
      <Lovefield />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex flex-col items-center pt-8 pb-12 text-center md:pt-16">
        <p className="animate-heartbeat font-mono text-[11px] uppercase tracking-[0.3em] text-champagne">✦ our orbit ✦</p>
        <h1 className="mt-4 font-display text-5xl font-medium leading-tight text-ivory md:text-6xl">
          <span className="text-gradient-love">{rel.name}</span>
        </h1>
        {rel.description ? <p className="mx-auto mt-4 max-w-md text-base text-fog">{rel.description}</p> : null}

        <LoveDuo mode="kiss" className="mt-7" />

        <div className="love-glow mt-7 rounded-2xl border border-champagne/25 bg-white/70 px-6 py-5 backdrop-blur">
          <RelationshipCounter startDate={rel.startDate} initial={counter} />
        </div>
      </section>

      {/* ── The universe ─────────────────────────────────────── */}
      <section id="universe" className="scroll-mt-24 py-6">
        <div className="text-center">
          <SectionLabel>The Biggylinho Universe</SectionLabel>
          <h2 className="font-display text-3xl font-medium text-ivory">Every moment became a star</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-fog">
            Each star is a real memory. The lines are the journey. The constellations are the chapters — and the sky keeps growing as we write more of us.
          </p>
        </div>
        <Constellation
          memories={memories}
          chapters={ordered}
          originName={rel.name}
          originDate={rel.startDate}
          originCaption="The day we became us."
          className="mt-6"
        />
      </section>

      <section className="flex flex-col items-center pb-12 text-center">
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {rel.members.map((m) => (
            <span key={m.id} className="rounded-full border border-champagne/30 bg-white/60 px-3 py-1 text-[12px] text-ink">
              {m.name}
              {m.isOwner ? <span className="ml-1.5 font-mono text-[9px] uppercase text-champagne">keeper</span> : null}
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
          <span className="text-champagne">code {rel.code}</span>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#story"
            className="love-glow inline-flex h-11 items-center gap-2 rounded-full bg-[#5a0b62] px-6 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 hover:bg-[#6d1a76]"
          >
            Begin our story <span aria-hidden className="animate-float-slow">↓</span>
          </a>
          <Link
            href="/messages"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-transparent bg-[#f5e6f5] px-6 text-sm text-[#2e0b33] backdrop-blur transition-colors hover:bg-[#eedeef]"
          >
            ♡ Open the chat
          </Link>
        </div>
      </section>

      {/* ── Our story, chapter by chapter ───────────────────── */}
      <section id="story" className="scroll-mt-24 space-y-10 py-8">
        <div className="text-center">
          <SectionLabel>How We Happened</SectionLabel>
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
          <Link href="/story" className="rounded-full border border-[#e9c9e6] bg-white/85 px-5 py-2 text-[13px] text-[#2e0b33] transition-colors hover:bg-[#f5e6f5]">
            Read the whole story →
          </Link>
          <Link href="/survived" className="rounded-full border border-[#e9c9e6] bg-white/85 px-5 py-2 text-[13px] text-[#2e0b33] transition-colors hover:bg-[#f5e6f5]">
            What we've been through{openSurvived > 0 ? ` · ${openSurvived} still open` : ""} →
          </Link>
        </div>
      </section>

      {/* ── Recent memories ─────────────────────────────────── */}
      <section className="space-y-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <SectionLabel>Keepsakes</SectionLabel>
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
            action={<Link href="/memories"><span className="rounded-full bg-[#5a0b62] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#6d1a76]">Add a memory</span></Link>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map((m) => (
              <Link key={m.id} href={`/memories/${m.id}`}>
                <div className="lift group h-full rounded-xl border border-line bg-white/70 p-4 transition-colors hover:border-champagne/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-champagne">{m.kind}</span>
                    <span className="text-[11px] text-mist">{fmtDay(m.date)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ivory transition-colors group-hover:text-champagne">{m.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-fog">{SHORTCUT(m.description, 120)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── The chat ─────────────────────────────────────────── */}
      <section className="space-y-4 py-10">
        <div className="love-glow rounded-2xl border border-champagne/25 bg-gradient-to-br from-white/80 to-champagne-faint p-6 backdrop-blur md:p-7">
          <SectionLabel>Sweet Talk</SectionLabel>
          <h2 className="mt-1 font-display text-3xl font-medium text-ivory">Us, talking</h2>
          {latestMessage ? (
            <p className="mt-2 text-sm text-fog">
              <span className="font-medium text-champagne">{latestMessage.authorName}:</span> {SHORTCUT(latestMessage.body, 120)}
            </p>
          ) : (
            <p className="mt-2 max-w-md text-sm text-fog">The running conversation between just the two of you. It starts when one of you says something.</p>
          )}
          <Link
            href="/messages"
            className="mt-5 inline-flex h-10 items-center rounded-full bg-[#5a0b62] px-6 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 hover:bg-[#6d1a76]"
          >
            ♡ Open the chat
          </Link>
        </div>
      </section>

      {/* ── The corners of the orbit ────────────────────────── */}
      <section className="space-y-6 py-10">
        <div className="text-center">
          <SectionLabel>Around the orbit</SectionLabel>
          <h2 className="font-display text-3xl font-medium text-ivory">Three more corners</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <CornerCard
            href="/words"
            title="Words of Us"
            body="Letters, open-when, confessions, dictionary, reflections — everything either of you has written."
            meta={`${letters.length} letters · ${confessions.length} confessions · ${dictionary.length} words`}
          />
          <CornerCard
            href="/world"
            title="Our Planet"
            body="Firsts, places we've gone, little things, and the songs that mean us."
            meta={`${firsts.length} firsts · ${places.length} places · ${soundtrack.length} songs`}
          />
          <CornerCard
            href="/future"
            title="Forever & Always"
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
    <Link href={href} className="lift group flex flex-col rounded-xl border border-line bg-white/70 p-5 transition-colors hover:border-champagne/40">
      <h3 className="font-display text-xl font-medium text-ivory transition-colors group-hover:text-champagne">{title}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-fog">{body}</p>
      <p className="mt-3 font-mono text-[9.5px] uppercase tracking-wider text-champagne">{meta}</p>
    </Link>
  );
}