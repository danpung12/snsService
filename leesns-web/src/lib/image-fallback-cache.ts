const failedImageUrls = new Set<string>();

export function hasFailedImageUrl(src?: string | null) {
  return Boolean(src && failedImageUrls.has(src));
}

export function rememberFailedImageUrl(src?: string | null) {
  if (!src) return;

  failedImageUrls.add(src);
}
