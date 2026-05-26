const TRUSTED_UPDATE_PROTOCOL = "https:";

function getConfiguredAllowedHosts() {
  const hosts = new Set<string>();

  const configured = import.meta.env.VITE_ALLOWED_UPDATE_HOSTS;
  if (configured) {
    for (const host of configured.split(",")) {
      const normalized = host.trim().toLowerCase();
      if (normalized) {
        hosts.add(normalized);
      }
    }
  }

  try {
    const convexHost = new URL(import.meta.env.VITE_CONVEX_URL).host.toLowerCase();
    hosts.add(convexHost);
  } catch {
    // Ignore malformed local configuration and rely on explicit env values.
  }

  return hosts;
}

export function getTrustedUpdateUrl(rawUrl: string | null | undefined) {
  if (!rawUrl) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== TRUSTED_UPDATE_PROTOCOL) {
    return null;
  }

  const allowedHosts = getConfiguredAllowedHosts();
  if (allowedHosts.size > 0 && !allowedHosts.has(parsed.host.toLowerCase())) {
    return null;
  }

  return parsed.toString();
}
