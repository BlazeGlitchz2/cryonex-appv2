const SPOTIFY_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function createSpotifyOAuthState() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

export async function hashSpotifyOAuthState(state: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(state),
  );
  return toHex(new Uint8Array(digest));
}

export function getSpotifyOAuthStateExpiry(now = Date.now()) {
  return now + SPOTIFY_OAUTH_STATE_TTL_MS;
}

export function sanitizeSpotifyConnection<T extends Record<string, unknown> | null>(
  connection: T,
) {
  if (!connection) {
    return null;
  }

  const { accessToken: _accessToken, refreshToken: _refreshToken, ...safe } =
    connection;
  return safe;
}
