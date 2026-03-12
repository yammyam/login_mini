import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

function getPostIdFromReq(req: Request) {
  const url = new URL(req.url);
  // /api/posts/{postId}/comments
  const parts = url.pathname.split("/");
  const idx = parts.findIndex((p) => p === "posts");
  return idx >= 0 ? parts[idx + 1] : null;
}

// 공개: 댓글 목록
export async function GET(req: Request) {
  const postId = getPostIdFromReq(req);
  if (!postId) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      authorId: true, // 이제 항상 string
      author: { select: { id: true } },
    },
  });

  return NextResponse.json(comments);
}

// 로그인 필요: 댓글 작성
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const postId = getPostIdFromReq(req);
  if (!postId) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }

  // (선택) post 존재 확인: FK가 있어서 없어도 생성 시 에러 나긴 함
  const exists = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const created = await prisma.comment.create({
    data: {
      postId,
      content: content.trim(),
      authorId: userId, //  필수
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      authorId: true,
      author: { select: { id: true } },
    },
  });

  return NextResponse.json(created, { status: 201 });
}
