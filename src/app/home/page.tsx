// app/home/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { Post } from "@/types";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    const res = await fetch(`/api/posts?authorId=${user}`, {
      cache: "no-store",
      headers: {
        "x-user-id": user ?? "",
      },
    });
    const data = await res.json();
    setPosts(data);
  };

  const deletePost = async (id: string) => {
    await fetch("/api/posts", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    await fetchPosts(); // 삭제 후 목록 새로고침
  };
  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async () => {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `홈에서 생성 - ${now}`,
        content: `버튼 클릭으로 생성됨 -(${now})`,
        authorId: user,
        createdAt: now,
      }),
    });

    alert("글 생성 완료");
    await fetchPosts();
  };

  return (
    <div>
      <h1>환영합니다, {user ?? ""}</h1>
      <button onClick={handleLogout}>로그아웃</button>
      <button onClick={createPost}>테스트 글 생성</button>
      <h2>글 목록</h2>
      {posts.map((item) => (
        <div key={item.id}>
          <div>{item.title}</div>
          <div>{item.content}</div>
          <div>author : {item.authorId}</div>
          <div>{item.createdAt}</div>
          {item.authorId === user && (
            <button onClick={() => deletePost(item.id)}>삭제</button>
          )}
          <hr />
        </div>
      ))}
    </div>
  );
}
