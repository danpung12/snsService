import { cookies } from "next/headers";
import CreatePostButton from "@/components/post/create-post-button";
import PostItem from "@/components/post/post-item";
import { API_URL } from "@/lib/api_url";
import type { Post } from "@/types";

async function getPosts(): Promise<Post[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const res = await fetch(`${API_URL}/posts`, {
    cache: "no-store",
    credentials: "include",
    headers: {
      ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
    },
  });

  if (res.status === 401) {
    const refreshRes = await fetch(`${API_URL}/auth/token/access`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(refreshToken ? { Cookie: `refreshToken=${refreshToken}` } : {}),
      },
    });

    if (refreshRes.ok) {
      const setCookie = refreshRes.headers.get("set-cookie");
      const newAccessToken = setCookie?.match(/accessToken=([^;]+)/)?.[1];

      if (newAccessToken) {
        const retryRes = await fetch(`${API_URL}/posts`, {
          cache: "no-store",
          credentials: "include",
          headers: {
            Cookie: `accessToken=${newAccessToken}`,
          },
        });

        if (!retryRes.ok) {
          const errorText = await retryRes.text();
          console.error(
            `🚨 재시도 후 백엔드 에러: ${retryRes.status} - ${errorText}`,
          );
          throw new Error("게시글을 불러오는 데 실패했습니다.");
        }
        return retryRes.json();
      }
    }
    throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`🚨 백엔드 에러 원인: ${res.status} - ${errorText}`);
    throw new Error("게시글을 불러오는 데 실패했습니다.");
  }
  return res.json();
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 p-4">
      <CreatePostButton />

      <section className="flex flex-col gap-8">
        {posts.map((post) => (
          <PostItem key={post.id} {...post} />
        ))}
      </section>
    </main>
  );
}
