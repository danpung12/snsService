"use client";

import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import { showAuthErrorPopup } from "@/lib/auth-error";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setLogin, setLogout, isLoad, isLoggedIn, setLoad } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth/success");

  useEffect(() => {
    let ignore = false;

    const restoreAuth = async () => {
      if (isPublicPath) {
        if (!ignore) {
          setLoad(true);
        }
        return;
      }

      try {
        const response = await api.get("/users/me");

        if (ignore) return;

        setLogin(response.data.id, response.data.nickname);
      } catch (error) {
        if (ignore) return;

        // 임시 디버그용: 인증 복구 실패 원인을 모달로 표시
        showAuthErrorPopup(error);

        setLogout();
        router.replace("/login");
      } finally {
        if (!ignore) {
          setLoad(true);
        }
      }
    };

    restoreAuth();

    return () => {
      ignore = true;
    };
  }, [isPublicPath, router, setLoad, setLogin, setLogout]);

  if (isPublicPath) return <>{children}</>;
  if (!isLoad) return null;
  if (!isLoggedIn) return null;

  return <>{children}</>;
}
