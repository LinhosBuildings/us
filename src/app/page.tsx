import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/session";
import { GalaxyPortal } from "@/components/galaxy-portal";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user?.relationshipId) redirect("/home");

  return (
    <GalaxyPortal>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#a24a7f]/80">
        step softly into our world
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/login">
          <span className="animate-gal-btn inline-flex h-12 w-full items-center rounded-full bg-gradient-to-r from-[#e44297] to-[#f0b25e] px-10 text-[13px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:scale-[1.03] hover:brightness-110 sm:w-auto">
            Sign in
          </span>
        </Link>
      </div>
      <p className="mx-auto max-w-sm text-[11px] leading-relaxed text-[#9b72a0]">
        Private for two. Free in demo mode. Your universe, offline if you want it.
      </p>
    </GalaxyPortal>
  );
}