// app/home/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { Post } from "@/types";
import { useEffect, useState } from "react";
import ui from "../styles/ui.module.css";
import styles from "./page.module.css";

export default function MyPage() {
  //   const [title, setTitle] = useState("");
  //   const [content, setContent] = useState("");
  const { user, logout } = useAuth(); //콘텍스트가 옴, 객체로 거기서 user와 logout만 꺼내겠다.
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const fetchPosts = async () => {
    const res = await fetch(`/api/mypage/posts`, {
      cache: "no-store",
      credentials: "include",
    });
    if (res.status === 401) {
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
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
    const res = await fetch("/api/posts", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
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

  const handleDeleteAccount = async () => {
    if (!confirm("탈퇴하면 모든 정보가 삭제됩니다. 탈퇴 하시겠습니까?")) return;

    const res = await fetch("/api/user", {
      method: "DELETE",
    });

    if (res.status === 401) {
      alert("로그인이 필요합니다.");
      router.replace("/login");
      return;
    }

    if (!res.ok) {
      alert("회원탈퇴 실패");
      return;
    }

    alert("회원탈퇴 완료");

    // 로그아웃 처리
    await logout();

    router.replace("/lounge");
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>환영합니다, {user ?? ""}</h1>
        <div className={styles.topActions}>
          <button className={ui.button} onClick={handleLogout}>
            로그아웃
          </button>
          <button className={ui.button} onClick={() => router.push("/write")}>
            글 작성하기
          </button>
          <button className={styles.dangerButton} onClick={handleDeleteAccount}>
            회원탈퇴
          </button>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>내가 쓴 글 : {posts.length}개</h2>
      </div>

      <input
        className={styles.searchBar}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="내 글 검색"
      />

      <div className={styles.postList}>
        {posts
          .filter(
            (item) =>
              item.title.toLowerCase().includes(search.toLowerCase()) ||
              item.content.toLowerCase().includes(search.toLowerCase())
          )
          .map((item) => (
            <div className={styles.postCard} key={item.id}>
              <div
                className={styles.postTitle}
                onClick={() => router.push(`/posts/${item.id}`)}
              >
                제목 - {item.title}
              </div>
              <div className={styles.meta}>글쓴이 - {item.authorId}</div>
              <div className={styles.postContent}>{item.content}</div>
              <div className={styles.meta}>
                {new Date(item.createdAt).toLocaleString("ko-KR")}
              </div>
              {/* {item.authorId === user && (
            <button onClick={() => deletePost(item.id)}>삭제</button>
          )}
          {item.authorId === user && (
            <button onClick={() => editPost(item.id)}>수정</button>
          )} */}
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
