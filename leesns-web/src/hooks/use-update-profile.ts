"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { uploadProfileImage } from "@/service/image";
import { updateMyProfile } from "@/service/user";
import { useUserId } from "@/store/auth";
import type { UseMutationCallback, User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProfile(callbacks?: UseMutationCallback) {
  const userId = useUserId();
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

      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
