"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { uploadProfileImage } from "@/service/image";
import { updateMyProfile } from "@/service/user";
import { useSetLogin, useUserId } from "@/store/auth";
import type { Post, PostAuthor, UseMutationCallback, User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function toPostAuthor(user: User): PostAuthor {
  return {
    id: String(user.id),
    nickname: user.nickname,
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? null,
    avatar_url: user.avatar_url ?? user.avatarUrl ?? null,
  };
}

export function useUpdateProfile(callbacks?: UseMutationCallback) {
  const userId = useUserId();
  const setLogin = useSetLogin();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nickname,
      avatarImageFile,
    }: {
      nickname?: string;
      avatarImageFile?: File;
    }) => {
      const avatarUrl = avatarImageFile
        ? await uploadProfileImage(avatarImageFile)
        : undefined;

      return updateMyProfile({
        ...(nickname !== undefined ? { nickname } : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
      });
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<User>(
        QUERY_KEYS.profile.byId(String(updatedProfile.id)),
        (profile) => ({
          ...profile,
          ...updatedProfile,
        }),
      );

      if (userId && String(updatedProfile.id) !== userId) {
        queryClient.setQueryData<User>(
          QUERY_KEYS.profile.byId(userId),
          (profile) => ({
            ...profile,
            ...updatedProfile,
          }),
        );
      }

      const updatedAuthor = toPostAuthor(updatedProfile);
      queryClient
        .getQueryCache()
        .findAll({ queryKey: QUERY_KEYS.post.all })
        .forEach((query) => {
          if (query.queryKey[1] !== "byId") return;

          queryClient.setQueryData<Post>(query.queryKey, (post) => {
            if (!post) return post;
            const isUpdatedAuthor =
              String(post.authorId) === updatedAuthor.id ||
              String(post.author?.id) === updatedAuthor.id;

            if (!isUpdatedAuthor) return post;

            return {
              ...post,
              author: {
                ...post.author,
                ...updatedAuthor,
              },
            };
          });
        });

      if (userId && String(updatedProfile.id) === userId) {
        setLogin(userId, updatedProfile.nickname);
      }

      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
