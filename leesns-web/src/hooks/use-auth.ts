import { LogIn, SignUp } from "@/service/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useSignUp = () => {
  return useMutation({
    mutationFn: SignUp,
  });
};

export const useLogin = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: LogIn,
    onSuccess: () => {
      router.push("/");
    },
  });
};
