import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}
export async function POST(req: Request) {
  const { title, content, author } = await req.json();

  const post = await prisma.post.create({
    data: { title, content, author },
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
