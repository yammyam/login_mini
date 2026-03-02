import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { id, password } = await req.json();

  // 1) 기본 검증
  if (!id || !password) {
    return NextResponse.json(
      { message: "id와 password가 필요합니다." },
      { status: 400 }
    );
  }

  // 2) 중복 체크
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { message: "이미 존재하는 아이디입니다." },
      { status: 409 }
    );
  }

  // 3) 비밀번호 해시
  const passwordHash = await bcrypt.hash(password, 10);

  // 4) 유저 생성
  await prisma.user.create({
    data: {
      id,
      passwordHash,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
