"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useNickname, useSetLogout } from "@/store/auth";
import CreatePostButton from "@/components/post/create-post-button";

export default function Home() {
  const router = useRouter();
  const setLogout = useSetLogout();
  const nickname = useNickname();

  const handleLogout = () => {
    setLogout();
    router.push("/login");
  };

  return (
    <div>
      안녕하세요 {nickname}님!
      <CreatePostButton />
      <Button onClick={handleLogout}>로그아웃</Button>
    </div>
  );
}
