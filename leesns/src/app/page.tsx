"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSetLogout, useUserId } from "@/store/auth";

export default function Home() {
  const router = useRouter();

  const setLogout = useSetLogout();
  const userId = useUserId();

  const handleLogout = () => {
    setLogout();
    router.push("/login");
  };

  return (
    <div>
      안녕하세요 {userId}님!
      <Button onClick={handleLogout}>로그아웃</Button>
    </div>
  );
}
