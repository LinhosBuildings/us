import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0c0a10] via-midnight to-[#0a0c0f] opacity-100" />
      <div className="pointer-events-none absolute right-[10%] top-[25%] h-[400px] w-[400px] rounded-full bg-champagne/[0.03] blur-[100px]" />
      <div className="pointer-events-none absolute left-[15%] bottom-[20%] h-[300px] w-[300px] rounded-full bg-sage/[0.03] blur-[90px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-medium text-gradient-gold">US</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}