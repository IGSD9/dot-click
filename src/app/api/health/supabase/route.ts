import { getSupabaseConfigErrorMessage, getSupabaseEnv } from "@/lib/supabase/env";

export async function GET() {
  const configError = getSupabaseConfigErrorMessage();
  const { url, key } = getSupabaseEnv();

  if (configError || !url || !key) {
    return Response.json({
      ok: false,
      step: "config",
      message: configError ?? "Supabase env missing",
      host: url ? new URL(url).host : null,
    });
  }

  const host = new URL(url).host;

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
    });

    return Response.json({
      ok: res.ok,
      step: "reachability",
      host,
      status: res.status,
    });
  } catch (error) {
    return Response.json({
      ok: false,
      step: "fetch",
      host,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}
