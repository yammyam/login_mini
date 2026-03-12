import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  // const cookieStore = await cookies();
  // const userId = cookieStore.get("session_user")?.value;
  // if (!userId) {
  //   return NextResponse.json([]);
  // }
  // 이제 쿠키로 인증하는 방식대신 세션의 session_id랑 일치하는 서버의 userId알아오기위해 변경

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { title, content } = await req.json();
  if (!title?.trim() || !content?.trim()) {
    //빈문자열 들어왔을때 오류방지?
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }
  const post = await prisma.post.create({
    data: { title, content, authorId: userId },
  });

  return NextResponse.json(post);
  // const { title, content, authorId } = await req.json();

  // await prisma.user.upsert({
  //   where: { id: authorId },
  //   update: {},
  //   create: { id: authorId },
  // });
  // const post = await prisma.post.create({
  //   data: { title, content, authorId },
  // });

  // return NextResponse.json(post);
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

export async function PATCH(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id, title, content } = await req.json();

  // id 검증
  if (!id) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }

  // title/content가 "둘 다 없으면" 수정할 게 없음
  const nextTitle = typeof title === "string" ? title.trim() : undefined;
  const nextContent = typeof content === "string" ? content.trim() : undefined;

  if (nextTitle === undefined && nextContent === undefined) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }

  // 빈 문자열로 바꾸는 건 막기 (원하면 허용으로 바꿔도 됨)
  if (nextTitle !== undefined && nextTitle.length === 0) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }
  if (nextContent !== undefined && nextContent.length === 0) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }

  // ✅ 핵심: 내 글만 수정 가능하도록 authorId + userId 같이 조건
  const updated = await prisma.post.updateMany({
    where: { id, authorId: userId },
    data: {
      ...(nextTitle !== undefined ? { title: nextTitle } : {}),
      ...(nextContent !== undefined ? { content: nextContent } : {}),
    },
  });

  if (updated.count === 0) {
    // 존재하지 않거나, 내 글이 아님
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
