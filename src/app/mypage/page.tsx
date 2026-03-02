// app/home/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { Post } from "@/types";
import { useEffect, useState } from "react";

export default function HomePage() {
  //   const [title, setTitle] = useState("");
  //   const [content, setContent] = useState("");
  const { user, logout } = useAuth(); //콘텍스트가 옴 객체로 거기서 user와 logout만 꺼내겠다.
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    const res = await fetch(`/api/mypage/posts`, {
      cache: "no-store",
      credentials: "include",
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
      },
      body: JSON.stringify({ id }),
    });
    alert("글 삭제 완료");
    await fetchPosts(); // 삭제 후 목록 새로고침
  };

  // const createPost = async () => { 글생성버튼(양식이 다입력된 고정된)을 만들기위해 만들어졌던 함수
  //   const res = await fetch("/api/posts", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       title: title,
  //       content: content,
  //       // createdAt: now, 서버로 보내는건데 이렇게 프론트에서 서버로 시간을 보내면 조작위험이 있음.
  //       // -> 고로 서버에서 찍히는 시간을 프론트쪽으로 불러와서 보여주는게 안전
  //     }),
  //   });
  //   if (!res.ok) {
  //     alert("글 생성 실패");
  //     return;
  //   }
  //   alert("글 생성 완료");
  //   setTitle("");
  //   setContent("");
  //   await fetchPosts();
  // };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      <h1>환영합니다, {user ?? ""}</h1>
      <button onClick={handleLogout}>로그아웃</button>
      <button onClick={() => router.push("/write")}>글 작성하기</button>
      <h2>내가 쓴 글</h2>
      {posts.map((item) => (
        <div key={item.id}>
          <div
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => router.push(`/posts/${item.id}`)}
          >
            제목 - {item.title}
          </div>
          <div>글쓴이 - {item.authorId}</div>
          <br />
          <div>{item.content}</div>
          <div>{new Date(item.createdAt).toLocaleString("ko-KR")}</div>
          {/* {item.authorId === user && (
            <button onClick={() => deletePost(item.id)}>삭제</button>
          )}
          {item.authorId === user && (
            <button onClick={() => editPost(item.id)}>수정</button>
          )} */}
          {item.authorId === user && (
            <>
              <button onClick={() => router.push(`/posts/${item.id}/edit`)}>
                수정
              </button>
              <button onClick={() => deletePost(item.id)}>삭제</button>
            </>
          )}
          <hr />
        </div>
      ))}
    </div>
  );
}
