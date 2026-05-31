"use server";

import { z } from "zod";
import { upsertUserFromAuth } from "@/actions/user";
import { prisma } from "@/lib/prisma";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const SaveScoreSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("survival"),
    clicks: z.number().int().min(0).max(999999),
  }),
  z.object({
    mode: z.literal("speed100"),
    elapsedMs: z.number().int().min(1).max(3_600_000),
  }),
]);

export type SaveScoreResult =
  | { success: true; updated: boolean; totalScore?: number; elapsedMs?: number }
  | { success: false; reason: "UNAUTHORIZED" | "NOT_CONFIGURED" | "DB_ERROR" };

export type LeaderboardMode = "survival" | "speed100";

export type LeaderboardEntry = {
  rank: number;
  userName: string;
  mode: LeaderboardMode;
  totalScore?: number;
  elapsedMs?: number;
};

async function getAuthUser() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;
  return { id: user.id, email: user.email };
}

export async function saveScore(
  input: z.infer<typeof SaveScoreSchema>
): Promise<SaveScoreResult> {
  if (!isSupabaseConfigured() || !process.env.DATABASE_URL) {
    return { success: false, reason: "NOT_CONFIGURED" };
  }

  const parsed = SaveScoreSchema.parse(input);
  const authUser = await getAuthUser();

  if (!authUser) {
    return { success: false, reason: "UNAUTHORIZED" };
  }

  try {
    await upsertUserFromAuth(authUser);

    const existing = await prisma.score.findUnique({
      where: {
        userId_mode: { userId: authUser.id, mode: parsed.mode },
      },
    });

    if (parsed.mode === "survival") {
      if (!existing) {
        const score = await prisma.score.create({
          data: {
            userId: authUser.id,
            mode: "survival",
            maxStage: 0,
            totalScore: parsed.clicks,
          },
        });
        return {
          success: true,
          updated: true,
          totalScore: score.totalScore,
        };
      }

      if (parsed.clicks <= existing.totalScore) {
        return {
          success: true,
          updated: false,
          totalScore: existing.totalScore,
        };
      }

      const score = await prisma.score.update({
        where: {
          userId_mode: { userId: authUser.id, mode: "survival" },
        },
        data: { totalScore: parsed.clicks },
      });

      return {
        success: true,
        updated: true,
        totalScore: score.totalScore,
      };
    }

    if (!existing) {
      const score = await prisma.score.create({
        data: {
          userId: authUser.id,
          mode: "speed100",
          maxStage: 0,
          totalScore: GAME_MODE_TARGET_SCORE,
          elapsedMs: parsed.elapsedMs,
        },
      });
      return {
        success: true,
        updated: true,
        elapsedMs: score.elapsedMs ?? parsed.elapsedMs,
      };
    }

    const currentElapsedMs = existing.elapsedMs ?? Number.MAX_SAFE_INTEGER;
    if (parsed.elapsedMs >= currentElapsedMs) {
      return {
        success: true,
        updated: false,
        elapsedMs: existing.elapsedMs ?? parsed.elapsedMs,
      };
    }

    const score = await prisma.score.update({
      where: {
        userId_mode: { userId: authUser.id, mode: "speed100" },
      },
      data: { elapsedMs: parsed.elapsedMs, totalScore: GAME_MODE_TARGET_SCORE },
    });

    return {
      success: true,
      updated: true,
      elapsedMs: score.elapsedMs ?? parsed.elapsedMs,
    };
  } catch {
    return { success: false, reason: "DB_ERROR" };
  }
}

const GAME_MODE_TARGET_SCORE = 20;

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
        userName: score.user.name,
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
      userName: score.user.name,
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
