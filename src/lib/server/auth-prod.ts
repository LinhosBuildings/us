import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase SSR client bound to the current request's cookies.
 * Used by production auth (NEXT_PUBLIC_APP_MODE=prod).
 * The session cookie Supabase manages replaces the demo HMAC cookie in prod.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — safe to ignore when middleware
          // refreshes sessions. (Next throws when mutating read-only cookies.)
        }
      },
    },
  });
}