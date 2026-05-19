import { create } from "zustand";
import { combine } from "zustand/middleware";

type OpenOptions = {
  returnTo: string;
  title?: string;
  description?: string;
};

const initialState = {
  isOpen: false,
  returnTo: "/",
  title: "로그인이 필요한 기능입니다.",
  description: "로그인 후 계속 이용할 수 있습니다.",
};

export const useLoginRequiredModalStore = create(
  combine(initialState, (set) => ({
    open: (options: OpenOptions) =>
      set({
        isOpen: true,
        returnTo: options.returnTo,
        title: options.title ?? initialState.title,
        description: options.description ?? initialState.description,
      }),
    close: () => set({ isOpen: false }),
  })),
);

export const useLoginRequiredModal = () => useLoginRequiredModalStore();
