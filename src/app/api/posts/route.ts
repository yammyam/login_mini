import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) {
    return NextResponse.json([]);
  }

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const { title, content, authorId } = await req.json();

  await prisma.user.upsert({
    where: { id: authorId },
    update: {},
    create: { id: authorId },
  });
  const post = await prisma.post.create({
    data: { title, content, authorId },
  });

  return NextResponse.json(post);
}

export async function DELETE(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await req.json();

  //삭제대상 글가져오기
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  //  작성자 체크 (인가)
  if (post.authorId !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  await prisma.post.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
