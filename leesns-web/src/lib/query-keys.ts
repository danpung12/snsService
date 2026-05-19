export const QUERY_KEYS = {
  profile: {
    all: ["profile"] as const,
    byId: (userId: string) => ["profile", "byId", userId] as const,
  },
  post: {
    all: ["post"] as const,
    list: ["post", "list"] as const,
    followingList: ["post", "list", "following"] as const,
    userList: (authorId: string) => ["post", "list", "user", authorId] as const,
    byId: (postId: number) => ["post", "byId", postId] as const,
  },
  stats: {
    postViewsLast7Days: (postId: number) =>
      ["stats", "post", postId, "views", "last-7-days"] as const,
  },
  follow: {
    all: ["follow"] as const,
    followers: (userId: string) => ["follow", "followers", userId] as const,
    followings: (userId: string) => ["follow", "followings", userId] as const,
  },
  comment: {
    all: ["comment"] as const,
    post: (postId: number) => ["comment", "post", postId] as const,
  },
  notification: {
    all: ["notification"] as const,
    list: ["notification", "list"] as const,
    unreadCount: ["notification", "unread-count"] as const,
  },
};
