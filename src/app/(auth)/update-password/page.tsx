"use client";

import Link from "next/link";
import { useActionState } from "react";
import { prodUpdatePassword, type ProdResetState } from "@/lib/server/account";
import { Card, SectionLabel, Input, Button } from "@/components/ui";

export default function UpdatePasswordPage() {
  const [state, formAction, pending] = useActionState<ProdResetState, FormData>(prodUpdatePassword, {});

  return (
    <Card className="p-8">
      <SectionLabel className="mb-1">Choose a new password</SectionLabel>
      <h2 className="font-display text-2xl font-medium text-ivory">A fresh start</h2>

      <form action={formAction} className="mt-8 space-y-4">
        <Input
          name="password"
          type="password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
          autoFocus
        />

        {state.error ? <p className="text-[13px] text-ember">{state.error}</p> : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Saving…" : "Save new password"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-fog">
        <Link href="/login" className="text-champagne hover:text-champagne-soft">Back to sign in</Link>
      </p>
    </Card>
  );
}