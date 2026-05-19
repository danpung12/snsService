"use client";

import { useLoginRequiredModalStore } from "@/store/login-required-modal";
import { useUserId } from "@/store/auth";
import { usePathname } from "next/navigation";

export function useRequireLogin() {
  const userId = useUserId();
  const pathname = usePathname();
  const openLoginRequiredModal = useLoginRequiredModalStore(
    (state) => state.open,
  );

  return (callback: () => void) => {
    if (userId) {
      callback();
      return true;
    }

    const query = window.location.search.slice(1);
    const returnTo = query ? `${pathname}?${query}` : pathname;

    openLoginRequiredModal({ returnTo });

    return false;
  };
}
