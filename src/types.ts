export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string | null;
  author?: { id: string } | null;
  createdAt: string;
}

export type CommentItem = {
  id: string;
  content: string;
  createdAt: string; // JSON으로 오면 string
  postId?: string;
  authorId: string; // ✅ 이제 null 아님
  author?: { id: string };
};
