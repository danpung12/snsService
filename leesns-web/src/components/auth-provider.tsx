"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/auth";
import { jwtDecode } from "jwt-decode";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setLogin, isLoad, setLoad } = useAuthStore();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    const rawNickname = Cookies.get("nickname");
    const nickname = rawNickname ? decodeURIComponent(rawNickname) : "";

    if (token) {
      setLogin(jwtDecode<{ userId: string }>(token).userId, nickname);
    } else setLoad(true);
  }, [setLogin]);

  return isLoad ? <>{children}</> : null;
}
