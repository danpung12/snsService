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
      if (result.token) {
        Cookies.set("token", result.token, { expires: 7 });
        setLogin(result.userId);

        router.push("/");
      }
    },
  });
};
