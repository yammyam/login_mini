// app/posts/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Post } from "@/types";

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    const res = await fetch(`/api/posts/${id}`, { cache: "no-store" });

    if (res.status === 401) {
      alert("로그인이 필요합니다.");
      router.replace("/login");
      return;
    }
    if (res.status === 404) {
      alert("글을 찾을 수 없습니다.");
      router.replace("/home");
      return;
    }
    if (!res.ok) {
      console.error("상세 조회 실패", await res.text());
      alert("상세 조회 실패");
      return;
    }

    const data = await res.json();
    setPost(data);
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchPost();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onDelete = async () => {
    if (!confirm("정말 삭제할까요?")) return;

    const res = await fetch("/api/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.status === 401) {
      alert("로그인이 필요합니다.");
      router.replace("/login");
      return;
    }
    if (res.status === 403) {
      alert("삭제 권한이 없습니다.");
      return;
    }
    if (!res.ok) {
      alert("삭제 실패");
      return;
    }

    alert("삭제 완료");
    router.replace("/home");
    router.refresh();
  };

  if (loading) return <div>불러오는 중...</div>;
  if (!post) return <div>데이터가 없습니다.</div>;

  return (
    <div>
      <button onClick={() => router.push(`/home`)}>홈으로</button>
      <h1>{post.title}</h1>
      <div>글쓴이 - {post.authorId}</div>
      <br />
      <div>{post.content}</div>

      <div>{new Date(post.createdAt).toLocaleString("ko-KR")}</div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => router.push(`/posts/${id}/edit`)}>수정</button>
        <button onClick={onDelete} style={{ marginLeft: 8 }}>
          삭제
        </button>
      </div>
    </div>
  );
}
