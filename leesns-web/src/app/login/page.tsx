"use client";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { BACKEND_URL } from "@/lib/api_url";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogInPage() {
  const { mutate: login, isPending } = useLogin();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleBackClick = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const submittedEmail = String(formData.get("email") ?? email).trim();
    const submittedPassword = String(formData.get("password") ?? password);

    if (submittedEmail === "") {
      window.alert("이메일을 입력해주세요.");
      return;
    }

    if (submittedPassword.trim() === "") {
      window.alert("비밀번호를 입력해주세요.");
      return;
    }

    setEmail(submittedEmail);
    setPassword(submittedPassword);
    login({ email: submittedEmail, password: submittedPassword });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  return (
    <div className="flex min-h-[calc(100dvh-220px)] items-center justify-center py-8">
      <div className="w-full max-w-md">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-4 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={handleBackClick}
        >
          <ArrowLeft className="size-4" />
          뒤로가기
        </Button>

        <section className="w-full rounded-2xl border bg-card p-6 shadow-[var(--shadow-panel)] md:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-muted/60">
              <Image src={logo} alt="서비스 로고" className="h-5 w-auto" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-2 text-sm font-medium">
                이메일
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="email"
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
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="password"
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
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.24-2.51c-.9.6-2.04.96-3.37.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.61 9.61 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z"
              />
            </svg>
            Google 계정으로 로그인
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            계정이 없다면{" "}
            <Link
              className="font-medium text-foreground hover:underline"
              href="/signup"
            >
              회원가입
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
