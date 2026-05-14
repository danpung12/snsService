"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSetLogin } from "@/store/auth";
import api from "@/lib/api";
import { showAuthErrorPopup } from "@/lib/auth-error";

export default function AuthSuccessPage() {
  const router = useRouter();
  const setLogin = useSetLogin();

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        const res = await api.get("/users/me");
        setLogin(res.data.id, res.data.nickname);
        router.replace("/");
      } catch (error) {
        showAuthErrorPopup(error);
        router.replace("/login");
      }
    };

    handleSuccess();
  }, [router, setLogin]);

  return <div>로그인 처리 중...</div>;
}
