import CreatePostButton from "@/components/post/create-post-button";
import PostFeed from "@/components/post/post-feed";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-6 md:py-10">
      <CreatePostButton />
      <PostFeed />
    </main>
  );
}
