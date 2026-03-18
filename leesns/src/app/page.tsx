"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

export default function Home() {
  const [userId, setUserId] = useState("");
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    setUserId("");
    router.push("/login");
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setUserId((jwtDecode(token) as any).userId);
    }
  }, []);

  return (
    <div>
      안녕하세요 {userId}님!
      <Button onClick={handleLogout}>로그아웃</Button>
    </div>
  );
}
