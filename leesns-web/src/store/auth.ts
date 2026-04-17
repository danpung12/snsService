import { create } from "zustand";
import { combine } from "zustand/middleware";
import Cookies from "js-cookie";

const initialState = {
  isLoad: false,
  isLoggedIn: false,
  userId: "",
  nickname: "",
};

export const useAuthStore = create(
  combine(initialState, (set) => ({
    setLogin: (id: string, nickname: string) =>
      set({ userId: id, nickname: nickname, isLoggedIn: true, isLoad: true }),

    setLogout: () => {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("userId");
      Cookies.remove("nickname");

      set({ userId: "", nickname: "", isLoggedIn: false, isLoad: true });
    },

    setLoad: (value: boolean) => {
      set({ isLoad: value });
    },
  })),
);

export const useSetLogin = () => useAuthStore((state) => state.setLogin);
export const useSetLogout = () => useAuthStore((state) => state.setLogout);
export const useUserId = () => useAuthStore((state) => state.userId);
export const useNickname = () => useAuthStore((state) => state.nickname);
