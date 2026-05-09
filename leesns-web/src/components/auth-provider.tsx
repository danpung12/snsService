"use client";

import { API_URL } from "@/lib/api_url";
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

    const fetchMyProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/me`, {
          withCredentials: true,
        });

        if (ignore) return;

        setLogin(response.data.id, response.data.nickname);

        if (isPublicPath) {
          router.replace("/");
        }
      } catch {
        if (ignore) return;

        setLogout();

        if (!isPublicPath) {
          router.replace("/login");
        }
      } finally {
        if (!ignore) {
          setLoad(true);
        }
      }
    };

    fetchMyProfile();

    return () => {
      ignore = true;
    };
  }, [isPublicPath, router, setLoad, setLogin, setLogout]);

  if (!isLoad) return null;
  if (!isPublicPath && !isLoggedIn) return null;

  return <>{children}</>;
}
