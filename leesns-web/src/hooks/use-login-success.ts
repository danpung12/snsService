import { useSetLogin } from "@/store/auth";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export function useLoginSuccess() {
  const setLogin = useSetLogin();
  const router = useRouter();

  const loginSuccess = async () => {
    try {
      const res = await api.get("/users/me");
      setLogin(res.data.id, res.data.nickname);
      router.replace("/");
    } catch (error) {
      console.error("Failed to fetch user profile after login", error);
      router.replace("/login");
    }
  };

  return loginSuccess;
}
