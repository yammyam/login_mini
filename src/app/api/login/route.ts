import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // 1) body에서 id 받기 (지금은 더미 로그인이라 id만 받음)
  const { id } = await req.json();

  // 2) 세션 만료시간 설정 (예: 7일)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  // 3) DB에 세션 생성 (sessionId는 자동 생성됨)
  const session = await prisma.session.create({
    data: {
      userId: id,
      expiresAt,
    },
    select: { id: true },
  });
  const cookieStore = await cookies();

  cookieStore.set("session_user", session.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return NextResponse.json({ ok: true });
}
