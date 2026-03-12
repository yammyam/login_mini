// app/posts/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import ui from "../../../styles/ui.module.css";

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
          router.replace("/lounge");
          return;
        }
        if (!res.ok) {
          console.error("수정용 조회 실패", await res.text());
          alert("불러오기 실패");
          return;
        }

        const data = await res.json();
        setTitle(data.post?.title ?? "");
        setContent(data.post?.content ?? "");
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
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={ui.button} onClick={() => router.back()}>
          뒤로가기
        </button>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>글 수정</h1>
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.field}>
            <div className={styles.label}>제목</div>
            <input
              className={ui.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>내용</div>
            <textarea
              className={ui.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용"
              rows={8}
            />
          </div>

          <div className={styles.actions}>
            <button className={ui.button} type="submit" disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => router.back()}
              disabled={saving}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
