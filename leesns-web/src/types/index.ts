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

export type UseMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error | any) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};
