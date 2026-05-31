import { prisma } from "@/lib/prisma";

function maskDatabaseHost(databaseUrl: string | undefined): string | null {
  if (!databaseUrl) return null;
  try {
    return new URL(databaseUrl.replace(/^postgresql:/, "http:")).hostname;
  } catch {
    return null;
  }
}

export async function GET() {
  const host = maskDatabaseHost(process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    return Response.json({
      ok: false,
      step: "config",
      message: "DATABASE_URL is not set",
      host,
    });
  }

  try {
    const [scoreCount, guestCount] = await Promise.all([
      prisma.score.count(),
      prisma.score.count({ where: { userId: null } }),
    ]);

    return Response.json({
      ok: true,
      host,
      scoreCount,
      guestCount,
    });
  } catch (error) {
    return Response.json({
      ok: false,
      step: "query",
      host,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}
