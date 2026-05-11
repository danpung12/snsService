import { create } from "zustand";
import { combine } from "zustand/middleware";

const initialState = {
  isOpen: false,
};

export const useProfileEditorModal = create(
  combine(initialState, (set) => ({
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
  })),
);

export const useOpenProfileEditorModal = () =>
  useProfileEditorModal((state) => state.open);
