export const LOGIN_RETURN_TO_KEY = "leesns:login-return-to";

export function normalizeReturnTo(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  if (value === "/login" || value === "/signup") {
    return "/";
  }

  return value;
}

export function saveLoginReturnTo(value: string) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(LOGIN_RETURN_TO_KEY, normalizeReturnTo(value));
}

export function consumeLoginReturnTo(fallback = "/") {
  if (typeof window === "undefined") return normalizeReturnTo(fallback);

  const stored = window.sessionStorage.getItem(LOGIN_RETURN_TO_KEY);
  window.sessionStorage.removeItem(LOGIN_RETURN_TO_KEY);

  return normalizeReturnTo(stored ?? fallback);
}
