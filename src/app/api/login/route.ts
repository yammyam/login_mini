import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id } = await req.json();

  const res = NextResponse.json({ ok: true });

  // ✅ 데모용 세션: HttpOnly 쿠키에 user id 저장
  res.cookies.set("session_user", id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
