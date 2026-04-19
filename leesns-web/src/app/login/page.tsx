"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";

export default function LogInPage() {
  const { mutate: Login } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (email.trim() === "") {
      window.alert("아이디를 입력해주세요");
    }
    if (password.trim() === "") {
      window.alert("비밀번호를 입력해주세요");
    }
    Login({ email, password });
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8 max-w-sm mx-auto">
      <div className="text-xl flex flex-col gap-8 font-bold  ">로그인</div>
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
      </div>

      <div>
        <Button className="w-full">로그인</Button>
      </div>
      <div>
        <Button
          className="w-full"
          variant={"outline"}
          onClick={handleGoogleLogin}
        >
          Google 계정으로 로그인
        </Button>
      </div>
      <div>
        <Link
          className="text-muted-foreground hover:underline"
          href={"/signup"}
        >
          계정이 없으시다면? 회원가입
        </Link>
      </div>
    </form>
  );
}
