"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function LogInPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUpClick = () => {
    if (id.trim() === "") {
      window.alert("아이디를 입력해주세요");
    }
    if (password.trim() === "") {
      window.alert("비밀번호를 입력해주세요");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-xl flex flex-col gap-8 font-bold">로그인</div>
      <div className="flex flex-col gap-2">
        <Input
          onChange={(e) => setId(e.target.value)}
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
        <Button onClick={handleSignUpClick} className="w-full">
          로그인
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
    </div>
  );
}
