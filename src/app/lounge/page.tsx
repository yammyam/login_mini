// app/lounge/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import type { Post } from "@/types";

export default function LoungePage() {
  const router = useRouter();
  const { user, logout } = useAuth(); // user = userId (string | null)
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    const res = await fetch("/api/posts", {
      cache: "no-store",
      credentials: "include", // 로그인 안 해도 보여줄 거면 없어도 되긴 함
    });

    if (!res.ok) {
      console.error("라운지 글목록 실패", await res.text());
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
    <div>
      <h1>목록</h1>
      <button onClick={handleLogout}>로그아웃</button>
      <button onClick={() => router.push("/write")}>글 작성</button>
      <button onClick={() => router.push("/mypage")}>마이페이지</button>

      <hr />

      {posts.map((item) => (
        <div key={item.id}>
          <div
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => router.push(`/posts/${item.id}`)}
          >
            {item.title}
          </div>

          <div>{item.content}</div>
          <div>author: {item.authorId ?? "익명"}</div>
          <div>{new Date(item.createdAt).toLocaleString("ko-KR")}</div>

          {/* ✅ 내 글일 때만 수정/삭제 */}
          {item.authorId === user && (
            <div>
              <button onClick={() => router.push(`/posts/${item.id}/edit`)}>
                수정
              </button>
              <button onClick={() => deletePost(item.id)}>삭제</button>
            </div>
          )}

          <hr />
        </div>
      ))}
    </div>
  );
}
