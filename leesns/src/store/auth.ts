import { create } from "zustand";
import { combine } from "zustand/middleware";
import Cookies from "js-cookie";

const initialState = {
  isLoad: false,
  isLoggedIn: false,
  userId: "",
};

export const useAuthStore = create(
  combine(initialState, (set) => ({
    setLogin: (id: string) =>
      set({ userId: id, isLoggedIn: true, isLoad: true }),

    setLogout: () => {
      Cookies.remove("token");
      set({ userId: "", isLoggedIn: false, isLoad: true });
    },

    setLoad: (value: boolean) => {
      set({ isLoad: value });
    },
  })),
);

export const useSetLogin = () => useAuthStore((state) => state.setLogin);
export const useSetLogout = () => useAuthStore((state) => state.setLogout);
export const useUserId = () => useAuthStore((state) => state.userId);
