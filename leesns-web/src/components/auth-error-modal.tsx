"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthErrorDetails = {
  url: string;
  status: string | number;
  code: string;
  message: string;
};

type AuthErrorState = {
  open: boolean;
  details: AuthErrorDetails | null;
};

const AUTH_ERROR_EVENT = "leesns-auth-error";

function formatMessage(message: unknown) {
  if (Array.isArray(message)) return message.join("\n");
  if (typeof message === "string") return message;
  if (message == null) return "N/A";
  return String(message);
}

function buildDetails(error: unknown): AuthErrorDetails {
  const fallback = error instanceof Error ? error : new Error("Unknown error");
  const axiosError = error as {
    config?: { url?: string };
    response?: { status?: number; data?: { code?: string; message?: unknown } };
    message?: string;
  } | null;

  const rawMessage = axiosError?.response?.data?.message;

  return {
    url: axiosError?.config?.url ?? "N/A",
    status: axiosError?.response?.status ?? "N/A",
    code: axiosError?.response?.data?.code ?? "N/A",
    message: formatMessage(rawMessage ?? fallback.message),
  };
}

export function emitAuthError(error: unknown) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(AUTH_ERROR_EVENT, {
      detail: buildDetails(error),
    }),
  );
}

export default function AuthErrorModal() {
  const [state, setState] = useState<AuthErrorState>({
    open: false,
    details: null,
  });

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<AuthErrorDetails>;
      setState({ open: true, details: customEvent.detail });
    };

    window.addEventListener(AUTH_ERROR_EVENT, handler);
    return () => window.removeEventListener(AUTH_ERROR_EVENT, handler);
  }, []);

  return (
    <Dialog
      open={state.open}
      onOpenChange={(open) => setState((prev) => ({ ...prev, open }))}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>요청 실패</DialogTitle>
          <DialogDescription>로그인 관련 요청에서 오류가 발생했습니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-md bg-muted p-4 text-sm font-medium whitespace-pre-wrap">
          <div>url: {state.details?.url ?? "N/A"}</div>
          <div>status: {state.details?.status ?? "N/A"}</div>
          <div>code: {state.details?.code ?? "N/A"}</div>
          <div>message: {state.details?.message ?? "N/A"}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
