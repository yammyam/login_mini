// app/signup/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id.trim() || !password.trim()) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });

      if (res.status === 409) {
        alert("이미 존재하는 아이디입니다.");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        console.error("회원가입 실패:", text);
        alert("회원가입 실패");
        return;
      }

      alert("회원가입 완료! 로그인 해주세요.");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>회원가입</h1>

      <form onSubmit={onSubmit}>
        <div>
          <label>아이디</label>
          <br />
          <input
            name="id"
            autoComplete="username"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>비밀번호</label>
          <br />
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            disabled={loading}
            style={{ marginLeft: 8 }}
          >
            로그인으로
          </button>
        </div>
      </form>
    </div>
  );
}
