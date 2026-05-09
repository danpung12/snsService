export const QUERY_KEYS = {
  profile: {
    all: ["profile"] as const,
    byId: (userId: string) => ["profile", "byId", userId] as const,
  },
  post: {
    all: ["post"] as const,
    list: ["post", "list"] as const,
    userList: (authorId: string) => ["post", "list", "user", authorId] as const,
    byId: (postId: number) => ["post", "byId", postId] as const,
  },
  comment: {
    all: ["comment"] as const,
    post: (postId: number) => ["comment", "post", postId] as const,
  },
};
