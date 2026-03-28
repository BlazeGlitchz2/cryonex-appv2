const DEFAULT_POST_AUTH_REDIRECT = "/study/dashboard";

type AuthAwareUser = {
  onboardingCompleted?: boolean | null;
};

const AUTH_ROUTES = new Set(["/login", "/auth"]);

function getBaseOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "https://cryonex.app";
}

export function sanitizeRedirectTarget(
  rawTarget?: string | null,
  fallback = DEFAULT_POST_AUTH_REDIRECT,
) {
  if (!rawTarget) {
    return fallback;
  }

  const candidate = rawTarget.trim();

  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  try {
    const baseOrigin = getBaseOrigin();
    const parsed = new URL(candidate, baseOrigin);

    if (parsed.origin !== baseOrigin) {
      return fallback;
    }

    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;

    if (
      Array.from(AUTH_ROUTES).some(
        (route) => normalized === route || normalized.startsWith(`${route}?`),
      )
    ) {
      return fallback;
    }

    return normalized;
  } catch {
    return fallback;
  }
}

export function readRedirectTarget(
  search:
    | string
    | URLSearchParams
    | { get(name: string): string | null | undefined },
  fallback = DEFAULT_POST_AUTH_REDIRECT,
) {
  if (typeof search === "string") {
    return sanitizeRedirectTarget(
      new URLSearchParams(search).get("redirect"),
      fallback,
    );
  }

  return sanitizeRedirectTarget(search.get("redirect"), fallback);
}

export function buildLoginPath(
  redirectTarget?: string | null,
  extraParams?: Record<string, string | null | undefined>,
) {
  const params = new URLSearchParams();
  const safeRedirect = sanitizeRedirectTarget(redirectTarget, "/onboarding");

  params.set("redirect", safeRedirect);

  Object.entries(extraParams || {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return `/login?${params.toString()}`;
}

export function buildOnboardingPath(redirectTarget?: string | null) {
  const safeRedirect = sanitizeRedirectTarget(
    redirectTarget,
    DEFAULT_POST_AUTH_REDIRECT,
  );
  const parsed = new URL(safeRedirect, getBaseOrigin());

  if (parsed.pathname === "/onboarding") {
    return safeRedirect;
  }

  const params = new URLSearchParams();
  params.set("redirect", safeRedirect);
  return `/onboarding?${params.toString()}`;
}

export function resolveAuthenticatedDestination({
  user,
  redirectTarget,
  fallback = DEFAULT_POST_AUTH_REDIRECT,
}: {
  user?: AuthAwareUser | null;
  redirectTarget?: string | null;
  fallback?: string;
}) {
  const safeRedirect = sanitizeRedirectTarget(redirectTarget, fallback);

  if (!user?.onboardingCompleted) {
    return buildOnboardingPath(safeRedirect);
  }

  if (new URL(safeRedirect, getBaseOrigin()).pathname === "/onboarding") {
    return fallback;
  }

  return safeRedirect;
}

export function resolveOnboardingCompletionDestination(
  redirectTarget?: string | null,
  fallback = DEFAULT_POST_AUTH_REDIRECT,
) {
  const safeRedirect = sanitizeRedirectTarget(redirectTarget, fallback);
  return new URL(safeRedirect, getBaseOrigin()).pathname === "/onboarding"
    ? fallback
    : safeRedirect;
}

export function buildNativeAuthRedirect(redirectTarget?: string | null) {
  const safeRedirect = sanitizeRedirectTarget(
    redirectTarget,
    DEFAULT_POST_AUTH_REDIRECT,
  );
  const parsed = new URL(safeRedirect, getBaseOrigin());
  const segments = parsed.pathname.replace(/^\/+/, "").split("/");
  const host = segments.shift() || "study";
  const path = segments.length ? `/${segments.join("/")}` : "";

  return `cryonex://${host}${path}${parsed.search}${parsed.hash}`;
}

export { DEFAULT_POST_AUTH_REDIRECT };
