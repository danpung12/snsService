import { LogIn, SignUp } from "@/service/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSetLogin } from "@/store/auth";
import api from "@/lib/api";
import { showAuthErrorPopup } from "@/lib/auth-error";
import { AxiosError } from "axios";

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

export const useLogin = () => {
  const router = useRouter();
  const setLogin = useSetLogin();

  return useMutation({
    mutationFn: LogIn,
    onSuccess: async () => {
      try {
        window.alert("1. /auth/login 성공, /users/me 요청 시작");

        const res = await api.get("/users/me");

        window.alert(
          `2. /users/me 성공\nid: ${res.data.id}\nnickname: ${res.data.nickname}`,
        );

        setLogin(res.data.id, res.data.nickname);

        window.alert("3. setLogin 완료, 메인으로 이동");

        router.replace("/");
      } catch (error) {
        const err = error as AxiosError<any>;

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
      const err = error as AxiosError<any>;

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
