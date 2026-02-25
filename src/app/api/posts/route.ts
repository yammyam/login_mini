import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  // const cookieStore = await cookies();
  // const userId = cookieStore.get("session_user")?.value;
  // if (!userId) {
  //   return NextResponse.json([]);
  // }
  // 이제 쿠키로 인증하는 방식대신 세션의 session_id랑 일치하는 서버의 userId알아오기위해 변경

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
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
  // const cookieStore = await cookies();
  // const userId = cookieStore.get("session_user")?.value;
  // if (!userId)
  //   return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  // 위와 동일하게 이제 쿠키로 인증하는 방식에서 세션인증방식으로 바뀜
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ message: "Unauthrized" }, { status: 401 });
  const { id } = await req.json();

  // //삭제대상 글가져오기
  // const post = await prisma.post.findUnique({ where: { id } });
  // if (!post) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  //  작성자 체크 (인가)
  // if (post.authorId !== userId) {
  //   return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  // }
  // 무슨 방식이였지? 왜 일일히 찾아서 삭제하지

  const deleted = await prisma.post.deleteMany({
    where: { id, authorId: userId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ message: "Fobidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
