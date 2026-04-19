import Cookies from "js-cookie";
import { useSetLogin } from "@/store/auth";
import { useRouter } from "next/navigation";

export function useLoginSuccess() {
  const setLogin = useSetLogin();
  const router = useRouter();

  const loginSuccess = (
    accessToken: string,
    refreshToken: string,
    userId: string,
    nickname: string = "구글 유저",
  ) => {
    // 1. 쿠키에 토큰 및 정보 저장
    Cookies.set("accessToken", accessToken);
    Cookies.set("refreshToken", refreshToken);
    Cookies.set("nickname", nickname);

    // 2. Zustand 전역 상태 업데이트
    setLogin(userId, nickname);

    // 3. 메인 화면으로 리다이렉트
    router.push("/");
  };

  return loginSuccess;
}
