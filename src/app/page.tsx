import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/session";
import { Button } from "@/components/ui";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user?.relationshipId) redirect("/home");

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* subtle mesh gradient bg */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0c0a10] via-midnight to-[#0a0c0f] opacity-100" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/[0.04] blur-[120px]" />

      <div className="relative z-10 max-w-xl space-y-6">
        <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight text-ivory md:text-6xl">
          <span className="text-gradient-gold">US</span>
        </h1>
        <p className="text-balance font-display text-xl font-light leading-relaxed text-fog md:text-2xl">
          A private universe.<br />
          <span className="text-ink/80">For two people.</span>
        </p>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-mist">
          What you remember, how you remember it, and the things you never said out loud — all in one place,
          shaped like a place, not a feed.
        </p>
        <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto">Create your universe</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">Sign in</Button>
          </Link>
        </div>
        <p className="pt-2 text-[11px] text-mist">Private for two. Free in demo mode. Your universe, offline if you want it.</p>
      </div>

      <div className="absolute bottom-6 text-[11px] text-mist/60">Yours, not the algorithm&rsquo;s.</div>
    </main>
  );
}