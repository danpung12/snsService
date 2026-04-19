"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/auth";
import axios from "axios";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setLogin, isLoad, setLoad } = useAuthStore();

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        // 1. 일단 찔러봄
        const response = await axios.get("http://localhost:4000/users/me", {
          withCredentials: true,
        });

        // 2. 성공하면 (쿠키가 유효하면) 정보 세팅
        setLogin(response.data.id, response.data.nickname);
      } catch (error) {
        // 🚨 3. 401 에러가 터지면 일로 도망옴!
        // 자바스크립트가 기절하지 않고, "아 로그인 안 된 유저구나!" 하고 넘깁니다.
        console.log("인증 실패: 로그인되지 않은 유저입니다.");
      } finally {
        // ✨ 4. 여기가 진짜 제일 중요합니다. (무적의 finally)
        // 성공하든 에러가 터지든 상관없이, 마지막에 무조건 로딩을 끝내줍니다!
        setLoad(true);
      }
    };

    fetchMyProfile();
  }, [setLogin, setLoad]);

  return isLoad ? <>{children}</> : null;
}
