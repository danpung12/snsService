// app/auth/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // 백엔드에서 이미 httpOnly 쿠키로 토큰을 구워 리다이렉트 했으므로
    // 토큰 확인 과정 없이 바로 메인 페이지로 이동합니다.
    router.push("/");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg font-semibold">
        로그인 중입니다. 잠시만 기다려주세요...
      </p>
    </div>
  );
}
