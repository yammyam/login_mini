// app/posts/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Post } from "@/types";

export default function PostEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
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
          console.error("수정용 조회 실패", await res.text());
          alert("불러오기 실패");
          return;
        }

        const post: Post = await res.json();
        setTitle(post.title);
        setContent(post.content);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, content }),
      });

      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        router.replace("/login");
        return;
      }
      if (res.status === 403) {
        alert("수정 권한이 없습니다.");
        return;
      }
      if (!res.ok) {
        alert("수정 실패");
        return;
      }

      alert("수정 완료");
      router.push(`/posts/${id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>불러오는 중...</div>;

  return (
    <div>
      <h1>글 수정</h1>

      <form onSubmit={onSubmit}>
        <div>
          <label>제목</label>
          <br />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>내용</label>
          <br />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용"
            rows={8}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            style={{ marginLeft: 8 }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
