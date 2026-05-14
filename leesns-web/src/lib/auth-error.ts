import axios from "axios";

type AuthErrorDetails = {
  url: string;
  status: string | number;
  code: string;
  message: string;
  rawMessage?: string;
};

function normalizeMessage(message: unknown) {
  if (Array.isArray(message)) return message.join("\n");
  if (typeof message === "string") return message;
  if (message == null) return "N/A";
  return String(message);
}

function getAuthErrorDetails(error: unknown): AuthErrorDetails {
  const fallbackError = error instanceof Error ? error : new Error("Unknown error");
  const axiosError = axios.isAxiosError(error) ? error : null;
  const rawMessage = axiosError?.response?.data?.message;
  const message = normalizeMessage(rawMessage ?? fallbackError.message);

  return {
    url: axiosError?.config?.url ?? "N/A",
    status: axiosError?.response?.status ?? "N/A",
    code: axiosError?.response?.data?.code ?? "N/A",
    message,
    rawMessage: normalizeMessage(rawMessage),
  };
}

export { getAuthErrorDetails };

export function showAuthErrorPopup(error: unknown) {
  const details = getAuthErrorDetails(error);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("leesns-auth-error", {
        detail: details,
      }),
    );
  }
}
