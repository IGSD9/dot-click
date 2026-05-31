"use server";

import { z } from "zod";
import { upsertUserFromAuth } from "@/actions/user";
import { prisma } from "@/lib/prisma";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const SaveScoreSchema = z.object({
  clicks: z.number().int().min(0).max(999999),
});

export type SaveScoreResult =
  | { success: true; updated: boolean; totalScore: number }
  | { success: false; reason: "UNAUTHORIZED" | "NOT_CONFIGURED" | "DB_ERROR" };

export type LeaderboardEntry = {
  rank: number;
  userName: string;
  totalScore: number;
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
      where: { userId: authUser.id },
    });

    if (!existing) {
      const score = await prisma.score.create({
        data: {
          userId: authUser.id,
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
      where: { userId: authUser.id },
      data: { totalScore: parsed.clicks },
    });

    return {
      success: true,
      updated: true,
      totalScore: score.totalScore,
    };
  } catch {
    return { success: false, reason: "DB_ERROR" };
  }
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    const scores = await prisma.score.findMany({
      orderBy: { totalScore: "desc" },
      take: Math.min(Math.max(limit, 1), 100),
      include: { user: { select: { name: true } } },
    });

    return scores.map((score, index) => ({
      rank: index + 1,
      userName: score.user.name,
      totalScore: score.totalScore,
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
    return prisma.score.findUnique({ where: { userId: authUser.id } });
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
