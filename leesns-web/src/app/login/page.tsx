"use client";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { ArrowRight, Chrome, LockKeyhole, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LogInPage() {
  const { mutate: login, isPending } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim() === "") {
      window.alert("이메일을 입력해주세요");
      return;
    }

    if (password.trim() === "") {
      window.alert("비밀번호를 입력해주세요");
      return;
    }

    login({ email, password });
  };

  const handleGoogleLogin = () => {
    window.location.href = "https://snsservice.onrender.com/auth/google";
  };

  return (
    <div className="flex min-h-[calc(100dvh-220px)] items-center justify-center py-8">
      <section className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm md:p-8">
        <div className="mb-8 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-muted">
              <Image src={logo} alt="서비스 로고" className="h-5 w-auto" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-normal">로그인</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                계정으로 돌아와 대화를 이어가세요.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-2 text-sm font-medium">
              이메일
              <div className="relative">
                <Mail className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-10"
                  type="email"
                  placeholder="example@abc.com"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              비밀번호
              <div className="relative">
                <LockKeyhole className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10"
                  type="password"
                  placeholder="password"
                  autoComplete="current-password"
                />
              </div>
            </label>
          </div>

          <Button type="submit" className="h-11 w-full" disabled={isPending}>
            {isPending ? "로그인 중..." : "로그인"}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-muted-foreground text-xs">또는</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          className="h-11 w-full"
          variant="outline"
          onClick={handleGoogleLogin}
        >
          <Chrome className="size-4" />
          Google 계정으로 로그인
        </Button>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          계정이 없다면{" "}
          <Link className="font-medium text-foreground hover:underline" href="/signup">
            회원가입
          </Link>
        </p>
      </section>
    </div>
  );
}
