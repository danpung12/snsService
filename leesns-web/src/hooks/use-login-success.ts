import { useSetLogin } from "@/store/auth";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { showAuthErrorPopup } from "@/lib/auth-error";

export function useLoginSuccess() {
  const setLogin = useSetLogin();
  const router = useRouter();

  const loginSuccess = async () => {
    try {
      const res = await api.get("/users/me");

      setLogin(res.data.id, res.data.nickname);
      router.replace("/");
    } catch (error) {
      // 임시 디버그용: 로그인 성공 후 유저 정보 조회 실패 원인을 모달로 표시
      showAuthErrorPopup(error);

      console.error("Failed to fetch user profile after login", error);
      router.replace("/login");
    }
  };

  return loginSuccess;
}
