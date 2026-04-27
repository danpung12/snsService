export const QUERY_KEYS = {
  post: {
    all: ["post"] as const,
    list: ["post", "list"] as const,
    byId: (postId: number) => ["post", "byId", postId] as const,
  },
};
