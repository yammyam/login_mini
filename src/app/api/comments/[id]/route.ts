import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

function getCommentIdFromReq(req: Request) {
  const url = new URL(req.url);
  // /api/comments/{commentId}
  return url.pathname.split("/").pop() ?? null;
}

export async function DELETE(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const commentId = getCommentIdFromReq(req);
  if (!commentId) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }

  // ✅ 내 댓글일 때만 삭제
  const deleted = await prisma.comment.deleteMany({
    where: { id: commentId, authorId: userId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
