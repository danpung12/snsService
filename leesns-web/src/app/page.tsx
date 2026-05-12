import CreatePostButton from "@/components/post/create-post-button";
import PostFeedTabs from "@/components/post/post-feed-tabs";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-6 md:py-10">
      <CreatePostButton />
      <PostFeedTabs />
    </main>
  );
}
