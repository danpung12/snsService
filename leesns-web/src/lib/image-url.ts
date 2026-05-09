import { API_URL } from "@/lib/api_url";

export function toBackendImageUrl(imagePath: string) {
  if (/^(https?:|data:|blob:)/.test(imagePath)) {
    return imagePath;
  }

  const normalizedPath = imagePath.replace(/\\/g, "/");
  const pathWithSlash = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;

  return `${API_URL}${pathWithSlash}`;
}
