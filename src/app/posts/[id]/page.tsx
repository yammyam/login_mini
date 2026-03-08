// app/posts/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Post } from "@/types";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
};

export default function PostDetailPage() {
  const [canEdit, setCanEdit] = useState(false);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    const res = await fetch(`/api/posts/${id}`, { cache: "no-store" });

    // if (res.status === 401) {
    //   alert("로그인이 필요합니다.");
    //   router.replace("/login");
    //   return;
    // }
    if (res.status === 404) {
      alert("글을 찾을 수 없습니다.");
      router.replace("/lounge");
      return;
    }
    if (!res.ok) {
      console.error("상세 조회 실패", await res.text());
      alert("상세 조회 실패");
      return;
    }

    const data = await res.json();
    setPost(data.post);
    setCanEdit(data.canEdit);
  };

  const fetchComments = async () => {
    const res = await fetch(`/api/posts/${id}/comments`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("댓글 불러오기 실패", await res.text());
      setComments([]);
      return;
    }

    const data = await res.json();
    setComments(data);
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchPost();
        await fetchComments();
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
    router.replace("/lounge");
    router.refresh();
  };

  const createComment = async () => {
    if (!commentText.trim()) {
      alert("댓글을 입력하세요.");
      return;
    }

    const res = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: commentText,
      }),
    });

    if (res.status === 401) {
      alert("로그인이 필요합니다.");
      router.replace("/login");
      return;
    }

    if (!res.ok) {
      alert("댓글 작성 실패");
      return;
    }

    setCommentText("");
    await fetchComments();
  };

  if (loading) return <div>불러오는 중...</div>;
  if (!post) return <div>데이터가 없습니다.</div>;

  return (
    <div>
      <button onClick={() => router.push(`/lounge`)}>홈으로</button>
      <h1>{post.title}</h1>
      <div>글쓴이 - {post.authorId}</div>
      <br />
      <div>{post.content}</div>

      <div>{new Date(post.createdAt).toLocaleString("ko-KR")}</div>

      {canEdit && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => router.push(`/posts/${id}/edit`)}>수정</button>
          <button onClick={onDelete} style={{ marginLeft: 8 }}>
            삭제
          </button>
        </div>
      )}
      <hr />
      <h3>댓글</h3>

      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="댓글 작성"
        rows={3}
      />

      <br />

      <button onClick={createComment}>댓글 작성</button>

      <hr />

      {comments.map((c) => (
        <div key={c.id}>
          <div>
            {c.authorId} | {new Date(c.createdAt).toLocaleString("ko-KR")}
          </div>

          <div>{c.content}</div>

          <hr />
        </div>
      ))}
    </div>
  );
}
