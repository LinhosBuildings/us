"use client";

import Link from "next/link";
import { useActionState } from "react";
import { prodForgotPassword, type ProdResetState } from "@/lib/server/account";
import { Card, SectionLabel, Input, Button } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<ProdResetState, FormData>(prodForgotPassword, {});

  return (
    <Card className="p-8">
      <SectionLabel className="mb-1">Reset your password</SectionLabel>
      <h2 className="font-display text-2xl font-medium text-ivory">Back to your universe</h2>
      <p className="mt-1 text-sm text-fog">We&rsquo;ll email you a reset link.</p>

      <form action={formAction} className="mt-8 space-y-4">
        <Input name="email" type="email" placeholder="you@email.com" required autoFocus autoComplete="email" />

        {state.error ? <p className="text-[13px] text-ember">{state.error}</p> : null}
        {state.notice ? <p className="text-[13px] text-sage">{state.notice}</p> : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-fog">
        <Link href="/login" className="text-champagne hover:text-champagne-soft">Back to sign in</Link>
      </p>
    </Card>
  );
}