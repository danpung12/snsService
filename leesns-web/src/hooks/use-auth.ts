import { LogIn, SignUp } from "@/service/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSetLogin } from "@/store/auth";
import api from "@/lib/api";

export const useSignUp = () => {
  const router = useRouter();
  const setLogin = useSetLogin();

  return useMutation({
    mutationFn: SignUp,
    onSuccess: async () => {
      const res = await api.get("/users/me");
      setLogin(res.data.id, res.data.nickname);
      router.replace("/");
    },
  });
};

export const useLogin = () => {
  const router = useRouter();
  const setLogin = useSetLogin();

  return useMutation({
    mutationFn: LogIn,
    onSuccess: async () => {
      const res = await api.get("/users/me");
      setLogin(res.data.id, res.data.nickname);
      router.replace("/");
    },
  });
};
