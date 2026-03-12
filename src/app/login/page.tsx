"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
    e.preventDefault(); //  추가: form submit 기본 동작 방지
    setError("");
    // const user = dummyUsers.find(
    //   (u) => u.id === form.id && u.password === form.password
    // );
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: form.id, password: form.password }),
    });
    if (res.ok) {
      // login(form.id); // 프론트 상태("환영합니다 user1" 표시용)
      await login();
      router.push("/lounge"); // 이동
      return;
    }
    let msg = "비밀번호 또는 아이디가 틀렸습니다.";
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}

    setError(msg);
    passwordRef.current?.focus();
    // if (user) {
    //   await fetch("/api/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ id: user.id }),
    //   });
    //   login(user.id); //  로그인 상태 업데이트
    //   router.push("/home"); //  로그인 성공 시 홈 페이지로 이동
    // } else {
    //   setError("비밀번호 또는 아이디가 틀렸습니다."); //  틀리면 에러 메시지
    //   passwordRef.current?.focus(); //  password input에 focus
    // }
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
          autoComplete="username"
        />
        <input
          name="password"
          onChange={onChange}
          value={form.password}
          type="password"
          placeholder="비밀번호"
          ref={passwordRef}
          autoComplete="current-password"
        />
        {error && <p className={style.error}>{error}</p>}
        <button className={style.button} type="submit">
          로그인
        </button>
        <button
          className={style.button}
          type="button"
          onClick={() => router.push("/signup")}
        >
          회원가입
        </button>
      </form>
    </div>
  );
}
