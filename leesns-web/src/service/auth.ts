import api from "@/lib/api";

export async function SignUp({
  email,
  nickname,
  password,
}: {
  email: string;
  nickname: string;
  password: string;
}) {
  const { data } = await api.post(`/auth/signup`, {
    email,
    nickname,
    password,
  });

  return data;
}

export async function LogIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data } = await api.post(
    `/auth/login`,

    {
      email,
      password,
    },
  );

  return data;
}
