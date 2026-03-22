// app/posts/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import Loading from "@/components/Loading";
import type { Post } from "@/types";
import ui from "../../styles/ui.module.css";
import styles from "./page.module.css";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
};

export default function PostDetailPage() {
  const { user, authChecked } = useAuth();
  const [canEdit, setCanEdit] = useState(false);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

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
  const deleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제할까요?")) return;

    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
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
      alert("댓글 삭제 실패");
      return;
    }

    await fetchComments();
  };

  const startEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingText(content);
  };

  const saveEditComment = async () => {
    if (!editingCommentId) return;

    if (!editingText.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }

    const res = await fetch(`/api/comments/${editingCommentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: editingText,
      }),
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
      alert("댓글 수정 실패");
      return;
    }

    setEditingCommentId(null);
    setEditingText("");
    await fetchComments();
  };

  // if (loading) return <div>불러오는 중...</div>;
  if (loading) return <Loading text="게시글 불러오는 중" />;
  if (!post) return <div>데이터가 없습니다.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={ui.button} onClick={() => router.push(`/lounge`)}>
          목록으로
        </button>
        {authChecked && user && (
          <button className={ui.button} onClick={() => router.push(`/mypage`)}>
            마이페이지
          </button>
        )}
      </div>
      <div className={styles.postCard}>
        <h1 className={styles.postTitle}>제목 - {post.title}</h1>

        <div className={styles.metaRow}>
          <div className={styles.meta}>글쓴이 - {post.authorId}</div>
          <div className={styles.meta}>
            {new Date(post.createdAt).toLocaleString("ko-KR")}
          </div>
        </div>

        <div className={styles.postContent}>{post.content}</div>

        {canEdit && (
          <div className={styles.postActions}>
            <button
              className={ui.button}
              onClick={() => router.push(`/posts/${id}/edit`)}
            >
              수정
            </button>
            <button className={ui.button} onClick={onDelete}>
              삭제
            </button>
          </div>
        )}
      </div>

      <div className={styles.commentSection}>
        <h3 className={styles.commentTitle}>댓글</h3>

        <div className={styles.commentWriteBox}>
          <textarea
            className={ui.textarea}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글 작성"
            rows={3}
          />
          <div className={styles.commentWriteActions}>
            <button className={ui.button} onClick={createComment}>
              댓글 작성
            </button>
          </div>
        </div>

        <div className={styles.commentList}>
          {comments.map((item) => (
            <div className={styles.commentCard} key={item.id}>
              <div className={styles.commentMeta}>
                {item.authorId}{" "}
                {new Date(item.createdAt).toLocaleString("ko-KR")}
              </div>

              {editingCommentId === item.id ? (
                <div className={styles.commentEditBox}>
                  <textarea
                    className={ui.textarea}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={3}
                  />
                  <div className={styles.commentActions}>
                    <button className={ui.button} onClick={saveEditComment}>
                      저장
                    </button>
                    <button
                      className={ui.button}
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditingText("");
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.commentContent}>{item.content}</div>
              )}

              {item.authorId === user && editingCommentId !== item.id && (
                <div className={styles.commentActions}>
                  <button
                    className={ui.button}
                    onClick={() => startEditComment(item.id, item.content)}
                  >
                    수정
                  </button>
                  <button
                    className={ui.button}
                    onClick={() => deleteComment(item.id)}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
