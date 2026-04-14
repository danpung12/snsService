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
    const token = Cookies.get("token");
    if (token) {
      setLogin(jwtDecode<{ userId: string }>(token).userId);
    } else setLoad(true);
  }, [setLogin]);

  return isLoad ? <>{children}</> : null;
}
