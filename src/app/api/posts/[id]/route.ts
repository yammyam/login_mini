import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  // if (!userId) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  // URL에서 id 직접 파싱 (타입 문제 없음)
  const url = new URL(req.url);
  const postId = url.pathname.split("/").pop();

  if (!postId) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const canEdit = !!userId && post.authorId === userId;
  return NextResponse.json({ post, canEdit });
}
