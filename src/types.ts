export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string | null;
  author?: { id: string } | null;
  createdAt: string;
}
