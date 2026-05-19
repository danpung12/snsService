"use client";

import api from "@/lib/api";
import { normalizeReturnTo, saveLoginReturnTo } from "@/lib/auth-navigation";
import { useAuthStore } from "@/store/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PROTECTED_PATH_PREFIXES = ["/chat", "/notifications", "/mypage", "/me"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setLogin, setLogout, isLoad, isLoggedIn, setLoad } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPath =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth/success");
  const isProtected = isProtectedPath(pathname);

  useEffect(() => {
    let ignore = false;

    const restoreAuth = async () => {
      try {
        const response = await api.get("/users/me");

        if (ignore) return;

        setLogin(response.data.id, response.data.nickname);

        if (isAuthPath) {
          const params = new URLSearchParams(window.location.search);
          router.replace(normalizeReturnTo(params.get("returnTo")));
        }
      } catch {
        if (ignore) return;

        setLogout();

        if (isProtected) {
          const query = window.location.search.slice(1);
          const returnTo = query ? `${pathname}?${query}` : pathname;

          saveLoginReturnTo(returnTo);
          router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
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
  }, [isAuthPath, isProtected, pathname, router, setLoad, setLogin, setLogout]);

  if (isAuthPath && isLoggedIn) return null;
  if (isProtected && !isLoad) return null;
  if (isProtected && !isLoggedIn) return null;

  return <>{children}</>;
}
