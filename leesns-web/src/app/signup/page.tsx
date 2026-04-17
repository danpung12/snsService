"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@/hooks/use-auth";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const { mutate: SignUp } = useSignUp();

  const handleSignUpClick = () => {
    if (email.trim() === "") {
      window.alert("아이디를 입력해주세요");
      return;
    }
    if (password.trim() === "") {
      window.alert("비밀번호를 입력해주세요");
      return;
    }
    if (nickname.trim() === "") {
      window.alert("닉네임을 입력해주세요");
      return;
    }

    SignUp({ email, password, nickname });
  };

  return (
    <div className="flex flex-col gap-8 max-w-sm mx-auto">
      <div className="text-xl flex flex-col gap-8 font-bold">회원가입</div>
      <div className="flex flex-col gap-2">
        <Input
          onChange={(e) => setEmail(e.target.value)}
          className="py-6"
          type="id"
          placeholder="example@abc.com"
        />
        <Input
          onChange={(e) => setPassword(e.target.value)}
          className="py-6"
          type="password"
          placeholder="password"
        />
        <Input
          onChange={(e) => setNickname(e.target.value)}
          className="py-6"
          type="text"
          placeholder="nickname"
        />
      </div>

      <div>
        <Button onClick={handleSignUpClick} className="w-full">
          회원가입
        </Button>
      </div>
      <div>
        <Link className="text-muted-foreground hover:underline" href={"/login"}>
          이미 계정이 있다면? 로그인
        </Link>
      </div>
    </div>
  );
}
