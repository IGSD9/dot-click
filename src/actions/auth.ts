"use server";

import { headers } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type SendMagicLinkResult =
  | { success: true }
  | { success: false; message: string };

export async function sendMagicLink(email: string): Promise<SendMagicLinkResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        "Supabase が未設定です。Vercel の Environment Variables を確認してください。",
    };
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "https";

  if (!host) {
    return { success: false, message: "リクエストの取得に失敗しました。" };
  }

  try {
    const supabase = await createClient();
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
  } catch {
    return {
      success: false,
      message: "ログインに失敗しました。しばらくしてから再度お試しください。",
    };
  }
}
