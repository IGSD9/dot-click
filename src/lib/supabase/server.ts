import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  return value.replace(/^["']|["']$/g, "");
}

export async function createClient() {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component からの set は無視してよい
        }
      },
    },
  });
}

export function isSupabaseConfigured() {
  return Boolean(
    readEnv("NEXT_PUBLIC_SUPABASE_URL") &&
      readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
