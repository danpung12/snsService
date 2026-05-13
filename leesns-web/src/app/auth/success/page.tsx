"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSetLogin } from "@/store/auth";
import api from "@/lib/api";

export default function AuthSuccessPage() {
  const router = useRouter();
  const setLogin = useSetLogin();

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        const res = await api.get("/users/me");
        setLogin(res.data.id, res.data.nickname);
        router.replace("/");
      } catch {
        router.replace("/login");
      }
    };

    handleSuccess();
  }, [router, setLogin]);

  return <div>로그인 처리 중...</div>;
}
