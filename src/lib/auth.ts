import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_user")?.value;
  console.log("[auth] sessionId from cookie:", sessionId);
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { userId: true, expiresAt: true },
  });
  console.log("[auth] session from db:", session);
  if (!session) return null;

  const now = new Date(); //  한 번만 만들기
  console.log("[auth] now ISO:", now.toISOString());
  console.log("[auth] expiresAt ISO:", session.expiresAt.toISOString());

  if (session.expiresAt < now) {
    console.log("[auth] EXPIRED -> delete cookie & session", sessionId);
    // cookieStore.delete("session_user");
    await prisma.session.delete({
      where: { id: sessionId },
    });
    console.log("[auth] deleted session row:", sessionId);

    return null;
  } // 만료시 쿠키랑 세션삭제

  return session.userId;
}
