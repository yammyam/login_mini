import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_user")?.value;

  // 1) DB 세션 삭제
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
  }

  // 2) 쿠키 삭제 (브라우저에서 session_user 제거) id랑 일치하는거끼리 userId를 담고있는 row의 Id
  cookieStore.set("session_user", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0), //1970-01-01 00:00:00 UTC가 시간으로 들어오니까 이미 과거시간이라 현재시간과의 불일치로 만료됨 판정.
  });

  return Response.json({ ok: true });
}
