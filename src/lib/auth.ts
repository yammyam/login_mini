import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_user")?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { userId: true, expiresAt: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) return null; // 만료

  return session.userId;
}
