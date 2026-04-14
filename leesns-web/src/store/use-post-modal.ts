"use client";

import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

const initialState = {
  isOpen: false,
};

const usePostModalStore = create(
  combine(initialState, (set) => ({
    action: {
      open: () => {
        set({ isOpen: true });
      },
      close: () => {
        set({ isOpen: false });
      },
    },
  })),
);

export const usePostModalOpen = () => {
  const open = usePostModalStore((store) => store.action.open);
  return open;
};

export const usePostModalClose = () => {
  const close = usePostModalStore((store) => store.action.close);
  return close;
};

export const usePostModalState = () => {
  const isOpen = usePostModalStore((store) => store.isOpen);
  return isOpen;
};
