function stripQuotes(value: string): string {
  return value.trim().replace(/^["'`""''\s]+|["'`""''\s]+$/g, "");
}

export function readRawDatabaseUrl(): string | undefined {
  const value = process.env.DATABASE_URL;
  if (!value) return undefined;
  const stripped = stripQuotes(value);
  return stripped || undefined;
}

export function isValidDatabaseUrl(url: string): boolean {
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

export function getDatabaseUrl(): string | undefined {
  const raw = readRawDatabaseUrl();
  if (!raw || !isValidDatabaseUrl(raw)) return undefined;
  return raw;
}

export function getDatabaseConfigErrorMessage(): string | null {
  const raw = readRawDatabaseUrl();

  if (!raw) {
    return "DATABASE_URL が未設定です。Vercel → Settings → Environment Variables を確認してください。";
  }

  if (raw.startsWith("https://") && raw.includes("supabase")) {
    return "DATABASE_URL に Supabase の Project URL（https://...supabase.co）が入っています。Supabase Dashboard → Settings → Database → Connection string → URI（postgresql://...）を設定してください。";
  }

  if (/^next_public_/i.test(raw) || raw.includes("example")) {
    return "DATABASE_URL の Value に Key 名や EXAMPLE が入っています。postgresql://... の接続文字列を設定してください。";
  }

  if (!isValidDatabaseUrl(raw)) {
    return "DATABASE_URL は postgresql:// で始まる接続文字列である必要があります。Supabase の Database URI を設定してください。";
  }

  return null;
}

export function getDatabaseConnectionHint(errorMessage: string): string | null {
  if (
    errorMessage.includes("Can't reach database server") &&
    errorMessage.includes(":5432")
  ) {
    return "Vercel から Direct connection（5432）には接続できません。Supabase Dashboard → Database → Connection string → Transaction pooler の URI（ポート 6543）を DATABASE_URL に設定して Redeploy してください。";
  }

  return null;
}

export function maskDatabaseHost(databaseUrl: string | undefined): string | null {
  if (!databaseUrl) return null;
  try {
    return new URL(databaseUrl.replace(/^postgresql:/, "http:")).hostname;
  } catch {
    return null;
  }
}
