"use client";

import api from "@/lib/api";
import { API_URL } from "@/lib/api_url";
import { showAuthErrorPopup } from "@/lib/auth-error";
import { useAuthStore } from "@/store/auth";
import axios from "axios";
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
      try {
        const response = isPublicPath
          ? await axios.get(`${API_URL}/users/me`, { withCredentials: true })
          : await api.get("/users/me");

        if (ignore) return;

        setLogin(response.data.id, response.data.nickname);

        if (isPublicPath) {
          router.replace("/");
        }
      } catch (error) {
        if (ignore) return;

        setLogout();

        if (!isPublicPath) {
          showAuthErrorPopup(error);
          router.replace("/login");
        }
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

  if (isPublicPath && isLoggedIn) return null;
  if (isPublicPath) return <>{children}</>;
  if (!isLoad) return null;
  if (!isLoggedIn) return null;

  return <>{children}</>;
}
