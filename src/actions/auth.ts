"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import {
  getSupabaseConfigErrorMessage,
  getSupabaseEnv,
} from "@/lib/supabase/env";

export type SendMagicLinkResult =
  | { success: true }
  | { success: false; message: string };

export async function sendMagicLink(email: string): Promise<SendMagicLinkResult> {
  const configError = getSupabaseConfigErrorMessage();
  if (configError) {
    return { success: false, message: configError };
  }

  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    return {
      success: false,
      message: "Supabase の設定を確認してください。",
    };
  }

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
      if (error.message === "fetch failed") {
        return {
          success: false,
          message:
            "Supabase に接続できません。Vercel の NEXT_PUBLIC_SUPABASE_URL と ANON_KEY を確認し、保存後に Redeploy してください。",
        };
      }
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
