"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase/server";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  return value.replace(/^["']|["']$/g, "");
}

export type SendMagicLinkResult =
  | { success: true }
  | { success: false; message: string };

export async function sendMagicLink(email: string): Promise<SendMagicLinkResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        "Supabase が未設定です。Vercel → Settings → Environment Variables を確認してください。",
    };
  }

  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL")!;
  const key = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")!;

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "https";

  if (!host) {
    return { success: false, message: "リクエストの取得に失敗しました。" };
  }

  try {
    const supabase = createSupabaseClient(url, key);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${proto}://${host}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown";
    return {
      success: false,
      message: `ログインに失敗しました: ${detail}`,
    };
  }
}
