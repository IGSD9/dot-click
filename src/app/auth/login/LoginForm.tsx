"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setMessage("ログインリンクをメールに送信しました。メールを確認してください。");
    } catch {
      setMessage(
        "ログインに失敗しました。Supabase の設定（.env.local）を確認してください。"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <h1 className="text-2xl font-bold text-white">ログイン</h1>
      <p className="mt-2 text-sm text-slate-400">
        メールアドレスに Magic Link を送信します。スコア保存に使います。
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm text-slate-300">
          メールアドレス
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-indigo-500 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {loading ? "送信中..." : "ログインリンクを送る"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}

      <Link
        href="/"
        className="mt-6 inline-block text-sm text-indigo-400 hover:underline"
      >
        ← トップへ戻る
      </Link>
    </div>
  );
}
