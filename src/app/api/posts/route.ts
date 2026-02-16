import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.post.findMany({
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
  const { id } = await req.json();

  await prisma.post.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
