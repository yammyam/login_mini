"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { dummyUsers } from "../data/dummyUsers";
import { useAuth } from "../providers";
import style from "./page.module.css";

export default function Page() {
  const [form, setForm] = useState({
    id: "",
    password: "",
  });
  const [error, setError] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { login } = useAuth();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 🔹 추가: form submit 기본 동작 방지
    const user = dummyUsers.find(
      (u) => u.id === form.id && u.password === form.password
    );

    if (user) {
      await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      login(user.id); // 🔹 로그인 상태 업데이트
      router.push("/home"); // 🔹 로그인 성공 시 홈 페이지로 이동
    } else {
      setError("비밀번호 또는 아이디가 틀렸습니다."); // 🔹 틀리면 에러 메시지
      passwordRef.current?.focus(); // 🔹 password input에 focus
    }
  };
  return (
    <div className={style.container}>
      <form className={style.form} onSubmit={onSubmit}>
        <h2>로그인</h2>
        <input
          name="id"
          value={form.id}
          type="text"
          placeholder="아이디 또는 이메일"
          onChange={onChange}
        />
        <input
          name="password"
          onChange={onChange}
          value={form.password}
          type="password"
          placeholder="비밀번호"
          ref={passwordRef}
        />
        {error && <p className={style.error}>{error}</p>}
        <button className={style.button} type="submit">
          LOGIN
        </button>
      </form>
    </div>
  );
}
