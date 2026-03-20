import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
//내 글 가져오는 전용 api
export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: userId }, { status: 200 });
}
