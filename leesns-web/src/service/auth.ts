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

export async function Logout() {
  const { data } = await api.post(`/auth/logout`);

  return data;
}

export async function SendEmailCode({ email }: { email: string }) {
  const { data } = await api.post(`/auth/email/code`, {
    email,
  });

  return data;
}

export async function VerifyEmailCode({
  email,
  code,
}: {
  email: string;
  code: string;
}) {
  const { data } = await api.post(`/auth/email/verify`, {
    email,
    code,
  });

  return data;
}
