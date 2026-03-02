// app/api/posts/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findFirst({
    where: { id: params.id, authorId: userId },
  });

  if (!post) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  return NextResponse.json(post);
}
