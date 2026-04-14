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
  const { data } = await axios.post(`${API_URL}/signup`, {
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
  const token = btoa(`${email}:${password}`);
  const { data } = await axios.post(
    `${API_URL}/login`,
    {},
    {
      headers: {
        Authorization: `Basic ${token}`,
      },
    },
  );

  return data;
}
