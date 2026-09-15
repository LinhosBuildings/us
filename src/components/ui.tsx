import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { twMerge } from "tailwind-merge";

const cnx = (...inputs: (string | undefined | null | false)[]) => twMerge(cn(...inputs));

/* ── Button ─────────────────────────────────────────────────── */

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-champagne text-midnight hover:bg-champagne-soft shadow-[0_8px_30px_-12px_rgba(201,169,97,0.7)]",
        outline:
          "border border-line-strong text-ink hover:border-champagne/50 hover:text-champagne-soft bg-transparent",
        ghost: "text-fog hover:text-ink hover:bg-white/5",
        soft: "bg-champagne-faint text-champagne-soft hover:bg-champagne/20",
        danger: "border border-ember/40 text-ember hover:bg-ember/10",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px]",
        md: "h-10 px-5",
        lg: "h-12 px-8 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cnx(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

/* ── Card ───────────────────────────────────────────────────── */

export function Card({
  className,
  glow = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      className={cnx("hairline rounded-2xl bg-panel/60 backdrop-blur-sm", glow && "glow-champagne", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Section label ──────────────────────────────────────────── */

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cnx("font-mono text-[11px] uppercase tracking-[0.28em] text-champagne/80", className)}>
      {children}
    </p>
  );
}

/* ── Eyebrow / editorial dividers ────────────────────────────── */

export function EditorialRule({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cnx("editorial-rule", className)}>
      {children ? <span className="text-champagne/70">{children}</span> : null}
    </div>
  );
}

/* ── Inputs ─────────────────────────────────────────────────── */

export const inputBase =
  "w-full rounded-xl border border-line bg-void/60 px-4 py-2.5 text-sm text-ink placeholder:text-mist transition-colors focus:border-champagne/50 focus:outline-none focus:ring-2 focus:ring-champagne/15";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cnx(inputBase, className)} {...props} />
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cnx(inputBase, "min-h-28 resize-y leading-relaxed", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink/90">{label}</span>
        {hint ? <span className="text-[11px] text-mist">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

/* ── Avatar ─────────────────────────────────────────────────── */

const AVATAR_PALETTE = ["#c9a961", "#c97d5f", "#7d8f7b", "#8b7da6", "#5b6478", "#a4c3b2"];

export function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  url,
  size = 40,
  className,
}: {
  name: string;
  url?: string | null;
  size?: number;
  className?: string;
}) {
  const hash = [...name].reduce((a, c) => a + (c.charCodeAt(0) || 0), 0);
  const bg = AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  const initials = initialsFor(name);
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      className={cnx("rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className={cnx("inline-flex items-center justify-center rounded-full font-display font-semibold text-midnight", className)}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.42 }}
    >
      {initials}
    </span>
  );
}

/* ── Badges / Pills ─────────────────────────────────────────── */

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "gold" | "ember" | "sage" | "soft";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/5 text-fog border-white/10",
    gold: "bg-champagne-faint text-champagne-soft border-champagne/20",
    ember: "bg-ember/10 text-ember border-ember/20",
    sage: "bg-sage/10 text-sage border-sage/20",
    soft: "bg-panel text-fog border-line",
  };
  return (
    <span
      className={cnx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ── Empty state ────────────────────────────────────────────── */

export function EmptyState({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line-strong px-6 py-16 text-center">
      {eyebrow ? <SectionLabel className="mb-3">{eyebrow}</SectionLabel> : null}
      <h3 className="font-display text-2xl font-medium text-ink">{title}</h3>
      {body ? <p className="mt-2 max-w-sm text-sm leading-relaxed text-fog">{body}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/* ── Date helpers ───────────────────────────────────────────── */

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}