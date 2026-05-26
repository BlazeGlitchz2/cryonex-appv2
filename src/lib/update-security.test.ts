import { afterEach, describe, expect, it, vi } from "vitest";

import { getTrustedUpdateUrl } from "./update-security";

describe("getTrustedUpdateUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts HTTPS updates from the Convex host by default", () => {
    vi.stubEnv("VITE_CONVEX_URL", "https://app-assets.convex.cloud");

    expect(
      getTrustedUpdateUrl("https://app-assets.convex.cloud/api/storage/update.zip"),
    ).toBe("https://app-assets.convex.cloud/api/storage/update.zip");
  });

  it("rejects non-HTTPS update URLs", () => {
    vi.stubEnv("VITE_CONVEX_URL", "https://app-assets.convex.cloud");

    expect(
      getTrustedUpdateUrl("http://app-assets.convex.cloud/api/storage/update.zip"),
    ).toBeNull();
  });

  it("rejects update URLs from untrusted hosts", () => {
    vi.stubEnv("VITE_CONVEX_URL", "https://app-assets.convex.cloud");

    expect(getTrustedUpdateUrl("https://evil.example/update.zip")).toBeNull();
  });

  it("accepts explicitly allowlisted hosts", () => {
    vi.stubEnv("VITE_CONVEX_URL", "https://app-assets.convex.cloud");
    vi.stubEnv(
      "VITE_ALLOWED_UPDATE_HOSTS",
      "downloads.cryonex.app,cdn.cryonex.app",
    );

    expect(getTrustedUpdateUrl("https://cdn.cryonex.app/mobile/update.zip")).toBe(
      "https://cdn.cryonex.app/mobile/update.zip",
    );
  });
});
