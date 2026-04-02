// app/lounge/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import type { Post } from "@/types";
import styles from "./page.module.css";
import ui from "../styles/ui.module.css";

export default function LoungePage() {
  const router = useRouter();
  const { user, logout, authChecked } = useAuth(); // user = userId (string | null)
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    const res = await fetch("/api/posts", {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("라운지 글 로딩 실패", await res.text());
      setPosts([]);
      return;
    }

    setPosts(await res.json());
  };

  const deletePost = async (id: string) => {
    const res = await fetch("/api/posts", {
      method: "DELETE",
      credentials: "include",
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
    alert("글 삭제 완료");
    await fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>목록</h1>
        <div className={styles.topActions}>
          {authChecked &&
            (user ? (
              <>
                <button className={ui.button} onClick={handleLogout}>
                  로그아웃
                </button>
                <button
                  className={ui.button}
                  onClick={() => router.push("/write")}
                >
                  글 작성
                </button>
                <button
                  className={ui.button}
                  onClick={() => router.push("/mypage")}
                >
                  마이페이지
                </button>
              </>
            ) : (
              <button
                className={ui.button}
                onClick={() => router.push("/login")}
              >
                로그인
              </button>
            ))}
        </div>

        <input
          className={styles.searchBar}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="제목 또는 내용의 키워드를 입력하세요!"
        />

        <div className={styles.postList}></div>
        {posts
          .filter(
            (item) =>
              item.title.toLowerCase().includes(search.toLowerCase()) ||
              item.content.toLowerCase().includes(search.toLowerCase())
          )
          .map((item) => (
            <div key={item.id} className={styles.postCard}>
              <div
                className={styles.postTitle}
                onClick={() => router.push(`/posts/${item.id}`)}
              >
                제목 - {item.title}
              </div>

              <div className={styles.postContent}>{item.content}</div>
              <div className={styles.meta}>
                글쓴이 - {item.authorId ?? "익명"}
              </div>
              <div className={styles.meta}>
                {new Date(item.createdAt).toLocaleString("ko-KR")}
              </div>
              <div className={styles.meta}>댓글 {item._count.comments}</div>

              {/*  내 글일 때만 수정/삭제 */}
              {item.authorId === user && (
                <div className={styles.postActions}>
                  <button
                    className={ui.button}
                    onClick={() => router.push(`/posts/${item.id}/edit`)}
                  >
                    수정
                  </button>
                  <button
                    className={ui.button}
                    onClick={() => {
                      const check = confirm("글을 삭제하시겠습니까?");
                      if (!check) return;
                      deletePost(item.id);
                    }}
                  >
                    삭제
                  </button>
                </div>
              )}

              <hr />
            </div>
          ))}
      </div>
    </div>
  );
}
