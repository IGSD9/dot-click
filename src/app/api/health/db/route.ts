import {
  getDatabaseConfigErrorMessage,
  maskDatabaseHost,
  readRawDatabaseUrl,
} from "@/lib/database";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const configError = getDatabaseConfigErrorMessage();
  const host = maskDatabaseHost(readRawDatabaseUrl());

  if (configError) {
    return Response.json({
      ok: false,
      step: "config",
      message: configError,
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
