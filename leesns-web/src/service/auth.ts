import api from "@/lib/api";
import { API_URL } from "@/lib/api_url";
import axios from "axios";

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
