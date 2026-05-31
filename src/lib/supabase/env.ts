function stripQuotes(value: string): string {
  return value.trim().replace(/^["'`""''\s]+|["'`""''\s]+$/g, "");
}

export function readRawEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  const stripped = stripQuotes(value);
  return stripped || undefined;
}

export function normalizeSupabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  const value = stripQuotes(raw);
  if (!value || value.startsWith("postgresql://")) return undefined;

  const withProtocol = /^https?:\/\//i.test(value)
    ? value
    : `https://${value.replace(/^\/+/, "")}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    if (!parsed.hostname.includes("supabase")) {
      return undefined;
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return undefined;
  }
}

export function getSupabaseEnv() {
  const rawUrl = readRawEnv("NEXT_PUBLIC_SUPABASE_URL");
  const url = normalizeSupabaseUrl(rawUrl);
  const key = readRawEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { rawUrl, url, key };
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseEnv();
  return Boolean(url && key);
}

export function getSupabaseConfigErrorMessage(): string | null {
  const { rawUrl, url, key } = getSupabaseEnv();

  if (url && key) return null;

  if (rawUrl?.startsWith("postgresql://")) {
    return "NEXT_PUBLIC_SUPABASE_URL に DATABASE_URL が入っています。Vercel で正しい Project URL に差し替えてください。";
  }

  if (rawUrl && !url) {
    if (/^next_public_/i.test(rawUrl) || rawUrl.includes("example")) {
      return "NEXT_PUBLIC_SUPABASE_URL の Value に Key 名や EXAMPLE が入っています。https://ghisemscbexvededtzuy.supabase.co を設定してください。";
    }
    return `NEXT_PUBLIC_SUPABASE_URL の形式が不正です。https://ghisemscbexvededtzuy.supabase.co を引用符なしで設定してください。`;
  }

  if (!key) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です。Supabase の anon public key（eyJ...）を Vercel に設定してください。";
  }

  return "Supabase が未設定です。Vercel → Settings → Environment Variables を確認してください。";
}
