"use server";

import { z } from "zod";
import { upsertUserFromAuth } from "@/actions/user";
import { prisma } from "@/lib/prisma";
import {
  normalizePlayerName,
  PLAYER_NAME_MAX,
  PLAYER_NAME_MIN,
  validatePlayerName,
} from "@/lib/player";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const GAME_MODE_TARGET_SCORE = 20;

const SaveGameScoreSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("survival"),
    clicks: z.number().int().min(0).max(999999),
    guestName: z.string().max(PLAYER_NAME_MAX).optional(),
  }),
  z.object({
    mode: z.literal("speed100"),
    elapsedMs: z.number().int().min(1).max(3_600_000),
    guestName: z.string().max(PLAYER_NAME_MAX).optional(),
  }),
]);

export type SaveScoreResult =
  | { success: true; updated: boolean; totalScore?: number; elapsedMs?: number }
  | {
      success: false;
      reason: "INVALID_NAME" | "NOT_CONFIGURED" | "DB_ERROR";
    };

export type LeaderboardMode = "survival" | "speed100";

export type LeaderboardEntry = {
  rank: number;
  userName: string;
  mode: LeaderboardMode;
  totalScore?: number;
  elapsedMs?: number;
};

export type PlayerIdentity =
  | { type: "authenticated"; name: string; email: string }
  | { type: "guest" };

async function getAuthUser() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;
  return { id: user.id, email: user.email };
}

function displayName(score: {
  guestName: string | null;
  user: { name: string } | null;
}): string {
  return score.guestName ?? score.user?.name ?? "Unknown";
}

async function saveAuthSurvivalScore(
  userId: string,
  clicks: number
): Promise<SaveScoreResult> {
  const existing = await prisma.score.findUnique({
    where: { userId_mode: { userId, mode: "survival" } },
  });

  if (!existing) {
    const score = await prisma.score.create({
      data: {
        userId,
        mode: "survival",
        maxStage: 0,
        totalScore: clicks,
      },
    });
    return { success: true, updated: true, totalScore: score.totalScore };
  }

  if (clicks <= existing.totalScore) {
    return {
      success: true,
      updated: false,
      totalScore: existing.totalScore,
    };
  }

  const score = await prisma.score.update({
    where: { userId_mode: { userId, mode: "survival" } },
    data: { totalScore: clicks },
  });

  return { success: true, updated: true, totalScore: score.totalScore };
}

async function saveGuestSurvivalScore(
  guestName: string,
  clicks: number
): Promise<SaveScoreResult> {
  const existing = await prisma.score.findFirst({
    where: {
      mode: "survival",
      userId: null,
      guestName,
    },
  });

  if (!existing) {
    const score = await prisma.score.create({
      data: {
        mode: "survival",
        guestName,
        maxStage: 0,
        totalScore: clicks,
      },
    });
    return { success: true, updated: true, totalScore: score.totalScore };
  }

  if (clicks <= existing.totalScore) {
    return {
      success: true,
      updated: false,
      totalScore: existing.totalScore,
    };
  }

  const score = await prisma.score.update({
    where: { id: existing.id },
    data: { totalScore: clicks },
  });

  return { success: true, updated: true, totalScore: score.totalScore };
}

async function saveAuthSpeed100Score(
  userId: string,
  elapsedMs: number
): Promise<SaveScoreResult> {
  const existing = await prisma.score.findUnique({
    where: { userId_mode: { userId, mode: "speed100" } },
  });

  if (!existing) {
    const score = await prisma.score.create({
      data: {
        userId,
        mode: "speed100",
        maxStage: 0,
        totalScore: GAME_MODE_TARGET_SCORE,
        elapsedMs,
      },
    });
    return {
      success: true,
      updated: true,
      elapsedMs: score.elapsedMs ?? elapsedMs,
    };
  }

  const currentElapsedMs = existing.elapsedMs ?? Number.MAX_SAFE_INTEGER;
  if (elapsedMs >= currentElapsedMs) {
    return {
      success: true,
      updated: false,
      elapsedMs: existing.elapsedMs ?? elapsedMs,
    };
  }

  const score = await prisma.score.update({
    where: { userId_mode: { userId, mode: "speed100" } },
    data: { elapsedMs, totalScore: GAME_MODE_TARGET_SCORE },
  });

  return {
    success: true,
    updated: true,
    elapsedMs: score.elapsedMs ?? elapsedMs,
  };
}

async function saveGuestSpeed100Score(
  guestName: string,
  elapsedMs: number
): Promise<SaveScoreResult> {
  const existing = await prisma.score.findFirst({
    where: {
      mode: "speed100",
      userId: null,
      guestName,
    },
  });

  if (!existing) {
    const score = await prisma.score.create({
      data: {
        mode: "speed100",
        guestName,
        maxStage: 0,
        totalScore: GAME_MODE_TARGET_SCORE,
        elapsedMs,
      },
    });
    return {
      success: true,
      updated: true,
      elapsedMs: score.elapsedMs ?? elapsedMs,
    };
  }

  const currentElapsedMs = existing.elapsedMs ?? Number.MAX_SAFE_INTEGER;
  if (elapsedMs >= currentElapsedMs) {
    return {
      success: true,
      updated: false,
      elapsedMs: existing.elapsedMs ?? elapsedMs,
    };
  }

  const score = await prisma.score.update({
    where: { id: existing.id },
    data: { elapsedMs, totalScore: GAME_MODE_TARGET_SCORE },
  });

  return {
    success: true,
    updated: true,
    elapsedMs: score.elapsedMs ?? elapsedMs,
  };
}

export async function getPlayerIdentity(): Promise<PlayerIdentity> {
  if (!isSupabaseConfigured() || !process.env.DATABASE_URL) {
    return { type: "guest" };
  }

  const authUser = await getAuthUser();
  if (!authUser) return { type: "guest" };

  try {
    await upsertUserFromAuth(authUser);
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { name: true },
    });

    return {
      type: "authenticated",
      name: user?.name ?? authUser.email.split("@")[0] ?? "player",
      email: authUser.email,
    };
  } catch {
    return { type: "guest" };
  }
}

export async function saveGameScore(
  input: z.infer<typeof SaveGameScoreSchema>
): Promise<SaveScoreResult> {
  if (!process.env.DATABASE_URL) {
    return { success: false, reason: "NOT_CONFIGURED" };
  }

  const parsed = SaveGameScoreSchema.parse(input);

  try {
    const authUser = await getAuthUser();

    if (authUser) {
      await upsertUserFromAuth(authUser);

      if (parsed.mode === "survival") {
        return saveAuthSurvivalScore(authUser.id, parsed.clicks);
      }
      return saveAuthSpeed100Score(authUser.id, parsed.elapsedMs);
    }

    const guestName = normalizePlayerName(parsed.guestName ?? "");
    const nameError = validatePlayerName(guestName);
    if (nameError) {
      return { success: false, reason: "INVALID_NAME" };
    }

    if (parsed.mode === "survival") {
      return saveGuestSurvivalScore(guestName, parsed.clicks);
    }
    return saveGuestSpeed100Score(guestName, parsed.elapsedMs);
  } catch {
    return { success: false, reason: "DB_ERROR" };
  }
}

/** @deprecated Use saveGameScore */
export async function saveScore(
  input: z.infer<typeof SaveGameScoreSchema>
): Promise<SaveScoreResult> {
  return saveGameScore(input);
}

export async function getLeaderboard(
  mode: LeaderboardMode,
  limit = 50
): Promise<LeaderboardEntry[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    if (mode === "survival") {
      const scores = await prisma.score.findMany({
        where: { mode: "survival" },
        orderBy: { totalScore: "desc" },
        take: safeLimit,
        include: { user: { select: { name: true } } },
      });

      return scores.map((score, index) => ({
        rank: index + 1,
        mode: "survival",
        userName: displayName(score),
        totalScore: score.totalScore,
      }));
    }

    const scores = await prisma.score.findMany({
      where: { mode: "speed100", elapsedMs: { not: null } },
      orderBy: { elapsedMs: "asc" },
      take: safeLimit,
      include: { user: { select: { name: true } } },
    });

    return scores.map((score, index) => ({
      rank: index + 1,
      mode: "speed100",
      userName: displayName(score),
      elapsedMs: score.elapsedMs ?? undefined,
    }));
  } catch {
    return [];
  }
}

export async function getMyScore() {
  if (!isSupabaseConfigured() || !process.env.DATABASE_URL) return null;

  const authUser = await getAuthUser();
  if (!authUser) return null;

  try {
    return prisma.score.findUnique({
      where: {
        userId_mode: { userId: authUser.id, mode: "survival" },
      },
    });
  } catch {
    return null;
  }
}

export async function getSessionEmail(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email ?? null;
  } catch {
    return null;
  }
}
