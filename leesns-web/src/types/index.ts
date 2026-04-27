export interface User {
  id: string | number;
  nickname: string;
  avatar_url?: string | null;
}

export interface Post {
  id: number;
  author: string;
  content: string;
  created_at: string | Date;
  image_urls?: string[];
}

export interface CursorPaginatedPosts {
  data: Post[];
  nextCursor: number | null;
  hasNextPage: boolean;
}

export type UseMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error | unknown) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};
