import { LogIn, SignUp } from "@/service/auth";
import { useSetLogin } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export const useSignUp = () => {
  return useMutation({
    mutationFn: SignUp,
  });
};

export const useLogin = () => {
  const router = useRouter();
  const setLogin = useSetLogin();
  return useMutation({
    mutationFn: LogIn,
    onSuccess: (result) => {
      if (result.accessToken && result.refreshToken) {
        Cookies.set("accessToken", result.accessToken);
        Cookies.set("refreshToken", result.refreshToken);
        Cookies.set("nickname", result.nickname);
        setLogin(result.userId, result.nickname);

        router.push("/");
      }
    },
  });
};
