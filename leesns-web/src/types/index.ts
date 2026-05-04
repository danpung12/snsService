export interface User {
  id: string | number;
  nickname: string;
  avatar_url?: string | null;
}

export interface PostAuthor {
  id: string;
  nickname: string;
  avatar_url?: string | null;
}

export interface Post {
  id: number;
  author: PostAuthor;
  authorId: string;
  content: string;
  created_at: string | Date;
  image_urls?: string[];
  likeCount?: number;
  commentCount?: number;
}

export interface CursorPaginatedPosts {
  data: Post[];
  nextCursor: number | null;
  hasNextPage: boolean;
}

export interface CommentAuthor {
  id: string;
  nickname: string;
}

export interface Comment {
  id: number;
  content: string;
  postId: number;
  authorId: string;
  created_at: string | Date;
  author?: CommentAuthor;
}

export interface CursorPaginatedComments {
  data: Comment[];
  nextCursor: number | null;
  hasNextComment: boolean;
}

export type NestedComment = Comment & {
  parentComment?: Comment;
  children: NestedComment[];
};

export type UseMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error | unknown) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};
