"use server";

import { prisma } from "@/lib/prisma";

type AuthUser = {
  id: string;
  email: string;
};

export async function upsertUserFromAuth(authUser: AuthUser) {
  const name = authUser.email.split("@")[0] || "player";

  return prisma.user.upsert({
    where: { id: authUser.id },
    create: {
      id: authUser.id,
      email: authUser.email,
      name,
    },
    update: {
      email: authUser.email,
    },
  });
}
