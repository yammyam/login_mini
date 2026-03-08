import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: userId }, { status: 200 });
}
