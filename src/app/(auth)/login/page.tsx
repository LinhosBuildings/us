"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, prodLogin, type LoginState, type ProdLoginState } from "@/lib/server/account";
import { Card, SectionLabel, Input, Button, Avatar } from "@/components/ui";

const IS_PROD = process.env.NEXT_PUBLIC_APP_MODE === "prod";

function ProdLogin() {
  const [state, formAction, pending] = useActionState<ProdLoginState, FormData>(prodLogin, {});
  return (
    <Card className="p-8">
      <SectionLabel className="mb-1">Sign in to your universe</SectionLabel>
      <h2 className="font-display text-2xl font-medium text-ivory">Welcome back</h2>
      <p className="mt-1 text-sm text-fog">Your private account — only the two of you.</p>

      <form action={formAction} className="mt-8 space-y-4">
        <Input name="email" type="email" placeholder="you@email.com" required autoFocus autoComplete="email" />
        <Input name="password" type="password" placeholder="Password" required autoComplete="current-password" />

        {state.error ? <p className="text-[13px] text-ember">{state.error}</p> : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-5 space-y-1 text-center text-[13px] text-fog">
        <p>
          No account yet?{" "}
          <Link href="/signup" className="text-champagne hover:text-champagne-soft">
            Create one
          </Link>
        </p>
        <p>
          <Link href="/forgot-password" className="text-fog underline-offset-2 hover:text-mist hover:underline">
            Forgot your password?
          </Link>
        </p>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});
  if (IS_PROD) return <ProdLogin />;
  const picking = state.members && state.members.length > 0;

  return (
    <Card className="p-8">
      {!picking ? (
        <>
          <SectionLabel className="mb-1">Sign in to your universe</SectionLabel>
          <h2 className="font-display text-2xl font-medium text-ivory">Welcome back</h2>
          <p className="mt-1 text-sm text-fog">Enter the secret you chose together.</p>

          <form action={formAction} className="mt-8 space-y-4">
            <Input name="code" type="password" placeholder="Our secret" required autoFocus autoComplete="off" />

            {state.error ? (
              <p className="text-[13px] text-ember">{state.error}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Checking…" : "Continue"}
            </Button>
          </form>

          <div className="mt-5 space-y-1 text-center text-[13px] text-fog">
            <p>
              New here?{" "}
              <Link href="/signup" className="text-champagne hover:text-champagne-soft">
                Create an account
              </Link>
            </p>
            <p>
              Have a code?{" "}
              <Link href="/join" className="text-champagne hover:text-champagne-soft">
                Join a universe
              </Link>
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-line bg-void/40 p-3 text-center text-[12px] text-mist">
            <span className="font-mono text-[11px] text-champagne">demo</span> secret:{" "}
            <span className="font-mono text-ivory">NOV13-24</span>
          </div>
        </>
      ) : (
        <>
          <SectionLabel className="mb-1">Almost there</SectionLabel>
          <h2 className="font-display text-2xl font-medium text-ivory">Who is signing in?</h2>
          <p className="mt-1 text-sm text-fog">Pick your side of the universe.</p>

          <div className="mt-8 grid gap-3">
            {state.members!.map((m) => (
              <form action={formAction} key={m.id}>
                <input type="hidden" name="code" value={state.code ?? ""} />
                <input type="hidden" name="member" value={m.id} />
                <button
                  type="submit"
                  disabled={pending}
                  className="flex w-full items-center gap-4 rounded-2xl border border-line bg-panel/40 px-4 py-3 text-left transition-colors hover:border-champagne/40 hover:bg-panel/80 disabled:opacity-60"
                >
                  <Avatar name={m.name} url={m.avatarUrl} size={44} />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-ivory">Continue as {m.name}</span>
                    <span className="block text-[12px] text-mist">Sign in</span>
                  </span>
                  <span className="text-champagne" aria-hidden>
                    →
                  </span>
                </button>
              </form>
            ))}
          </div>

          {state.error ? <p className="mt-4 text-[13px] text-ember">{state.error}</p> : null}

          <form action={formAction} className="mt-5 text-center">
            <input type="hidden" name="reset" value="1" />
            <button type="submit" disabled={pending} className="text-[13px] text-fog underline-offset-2 hover:text-mist hover:underline">
              Use a different code
            </button>
          </form>
        </>
      )}
    </Card>
  );
}