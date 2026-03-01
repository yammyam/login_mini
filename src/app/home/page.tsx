// app/home/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { Post } from "@/types";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user, logout } = useAuth(); //콘텍스트가 옴 객체로 거기서 user와 logout만 꺼내겠다.
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    const res = await fetch(`/api/posts`, {
      cache: "no-store",
    });
    if (res.status === 401) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      setPosts([]); //  map 터짐 방지
      router.replace("/login");
      return;
    }
    if (!res.ok) {
      // 기타 에러
      console.error("글목록 가져오기 실패", await res.text());
      setPosts([]); // 에러창안뜨게하기위해 안전장치
      return;
    }
    const data = await res.json();
    setPosts(data);
  };

  const deletePost = async (id: string) => {
    await fetch("/api/posts", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user ?? "",
      },
      body: JSON.stringify({ id }),
    });
    alert("글 삭제 완료");
    await fetchPosts(); // 삭제 후 목록 새로고침
  };

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

  useEffect(() => {
    fetchPosts();
  }, []);

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
