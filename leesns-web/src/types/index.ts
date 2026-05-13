export interface User {
  id: string | number;
  nickname: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
}

export interface PostAuthor {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
}

export interface PostImage {
  id: number;
  url: string;
  order: number;
  createdAt?: string | Date;
  postId?: number;
}

export interface Post {
  id: number;
  author: PostAuthor;
  authorId: string;
  content: string;
  created_at: string | Date;
  images?: PostImage[];
  image?: string | null;
  image_urls?: string[];
  likeCount?: number;
  isLiked?: boolean;
  commentCount?: number;
}

export interface TogglePostLikeResponse {
  likeCount: number;
  isLiked: boolean;
}

export interface FollowRelation {
  id: string;
  followerId: string;
  followedId: string;
  follower?: User;
  followed?: User;
}

export interface FollowResponse {
  isFollowing: boolean;
}

export interface ChatRoom {
  id: string;
  createdAt?: string | Date;
  dmKey?: string;
  lastMessage?: string;
  lastMessageAt?: string | Date;
  users?: User[];
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id?: string;
  roomId: string;
  chatRoomId?: string;
  content: string;
  senderId: string;
  sender?: User;
  createdAt: string;
}

export interface CursorPaginatedChatMessages {
  data: ChatMessage[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface CursorPaginatedPosts {
  data: Post[];
  nextCursor: number | null;
  hasNextPage: boolean;
}

export interface CommentAuthor {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
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
