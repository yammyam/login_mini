import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // 1) body에서 id 받기 (지금은 더미 로그인이라 id만 받음)-> 회원가입을 위해 password도 받음
  const { id, password } = await req.json();
  // 1-2) 입력 검증
  if (!id || !password) {
    return NextResponse.json(
      { message: "id와 password가 필요합니다." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, passwordHash: true },
  });

  // 3) 존재/해시 여부 체크
  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }
  // 4) 비밀번호 검증
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  // 2) 세션 만료시간 설정 (예: 7일)
  // const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 세션용 1분짜리
  // 3) DB에 세션 생성 (sessionId는 자동 생성됨)
  const session = await prisma.session.create({
    data: {
      userId: id,
      expiresAt, //DB세션에 저장되는건 1분
    },
    select: { id: true },
  });
  const cookieStore = await cookies();
  // const cookieExpires = new Date(Date.now() + 10 * 60 * 1000); //세션이 읽을수있도록 브라우저 쿠키는 좀길게

  cookieStore.set("session_user", session.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return NextResponse.json({ ok: true });
}
