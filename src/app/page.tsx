// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // "/" 접속 시 login 페이지로 이동
  redirect("/login");
}
