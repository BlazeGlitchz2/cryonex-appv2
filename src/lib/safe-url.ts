const SAFE_EXTERNAL_PROTOCOLS = new Set(["http:", "https:"]);

export function getSafeExternalUrl(rawUrl: string | null | undefined) {
  if (!rawUrl) return null;

  try {
    const parsed = new URL(rawUrl, window.location.origin);
    if (!SAFE_EXTERNAL_PROTOCOLS.has(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function openSafeExternalUrl(rawUrl: string | null | undefined) {
  const safeUrl = getSafeExternalUrl(rawUrl);
  if (!safeUrl) {
    return false;
  }

  window.open(safeUrl, "_blank", "noopener,noreferrer");
  return true;
}
