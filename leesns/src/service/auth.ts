import { API_URL } from "@/lib/api_url";
import axios from "axios";

export async function SignUp({
  userId,
  password,
}: {
  userId: string;
  password: string;
}) {
  const { data } = await axios.post(`${API_URL}/signup`, { userId, password });

  return data;
}

export async function LogIn({
  userId,
  password,
}: {
  userId: string;
  password: string;
}) {
  const { data } = await axios.post(`${API_URL}/login`, { userId, password });

  return data;
}
