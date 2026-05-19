import {
  LogIn,
  Logout,
  SendEmailCode,
  SignUp,
  VerifyEmailCode,
} from "@/service/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSetLogin, useSetLogout } from "@/store/auth";
import api from "@/lib/api";
import { getAuthErrorDetails, showAuthErrorPopup } from "@/lib/auth-error";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { consumeLoginReturnTo, normalizeReturnTo } from "@/lib/auth-navigation";
import { QUERY_KEYS } from "@/lib/query-keys";

type AuthErrorResponse = {
  code?: string;
  message?: string | string[];
};

export const useSignUp = () => {
  const router = useRouter();
  const setLogin = useSetLogin();

  return useMutation({
    mutationFn: SignUp,
    onSuccess: async () => {
      try {
        const res = await api.get("/users/me");
        setLogin(res.data.id, res.data.nickname);
        router.replace("/");
      } catch (error) {
        showAuthErrorPopup(error);
      }
    },
    onError: (error) => {
      showAuthErrorPopup(error);
    },
  });
};

export const useSendEmailCode = () => {
  return useMutation({
    mutationFn: SendEmailCode,
  });
};

export const useVerifyEmailCode = () => {
  return useMutation({
    mutationFn: VerifyEmailCode,
  });
};

export const useLogout = () => {
  const router = useRouter();
  const setLogout = useSetLogout();

  return useMutation({
    mutationFn: Logout,
    onSuccess: () => {
      setLogout();
      router.replace("/");
    },
    onError: (error) => {
      const message = getAuthErrorDetails(error).message;

      toast.error(message === "N/A" ? "로그아웃에 실패했습니다." : message);
    },
  });
};

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setLogin = useSetLogin();

  return useMutation({
    mutationFn: LogIn,
    onSuccess: async () => {
      try {
        const res = await api.get("/users/me");
        setLogin(res.data.id, res.data.nickname);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.post.all });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.follow.all });

        const params = new URLSearchParams(window.location.search);
        router.replace(
          consumeLoginReturnTo(normalizeReturnTo(params.get("returnTo"))),
        );
      } catch (error) {
        const err = error as AxiosError<AuthErrorResponse>;

        window.alert(
          `에러 상세\n` +
            `url: ${err.config?.url}\n` +
            `status: ${err.response?.status}\n` +
            `code: ${err.response?.data?.code ?? "N/A"}\n` +
            `message: ${
              Array.isArray(err.response?.data?.message)
                ? err.response.data.message.join("\n")
                : (err.response?.data?.message ?? err.message)
            }\n` +
            `hasResponse: ${!!err.response}`,
        );

        showAuthErrorPopup(err);
      }
    },
    onError: (error) => {
      const err = error as AxiosError<AuthErrorResponse>;

      window.alert("4. /users/me 실패 catch 진입");

      window.alert(
        `0. /auth/login 실패\n` +
          `url: ${err.config?.url}\n` +
          `status: ${err.response?.status}\n` +
          `code: ${err.response?.data?.code ?? "N/A"}\n` +
          `message: ${
            Array.isArray(err.response?.data?.message)
              ? err.response.data.message.join("\n")
              : (err.response?.data?.message ?? err.message)
          }\n` +
          `hasResponse: ${!!err.response}`,
      );

      showAuthErrorPopup(err);
    },
  });
};
