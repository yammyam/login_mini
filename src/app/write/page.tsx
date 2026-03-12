// app/write/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ui from "../styles/ui.module.css";
import styles from "./page.module.css";

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        router.replace("/login");
        return;
      }

      if (!res.ok) {
        alert("글 작성 실패");
        return;
      }

      // 작성 완료 → 목록으로
      router.push("/lounge");
      router.refresh(); // (선택) 서버/캐시 갱신에 도움
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={ui.button} onClick={() => router.back()}>
          뒤로가기
        </button>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>글 작성</h1>

        <form className={styles.subText} onSubmit={onSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>제목</label>
            <input
              className={ui.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>내용</label>
            <textarea
              className={ui.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용"
              rows={8}
            />
          </div>

          <div className={styles.actions}>
            <button className={ui.button} type="submit" disabled={loading}>
              {loading ? "작성 중..." : "작성"}
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => router.back()}
              disabled={loading}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
