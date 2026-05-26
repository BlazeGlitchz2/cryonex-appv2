import { describe, expect, it } from "vitest";

import {
  createSpotifyOAuthState,
  getSpotifyOAuthStateExpiry,
  hashSpotifyOAuthState,
  sanitizeSpotifyConnection,
} from "./spotifySecurity";

describe("spotifySecurity", () => {
  it("creates random hex oauth state values", () => {
    const first = createSpotifyOAuthState();
    const second = createSpotifyOAuthState();

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toBe(second);
  });

  it("hashes oauth state deterministically", async () => {
    await expect(hashSpotifyOAuthState("spotify-state")).resolves.toBe(
      "8ae9b3ec957d3acd52b1de60653d005c641485492b2566ff692045e872dde030",
    );
  });

  it("uses a short-lived oauth state ttl", () => {
    expect(getSpotifyOAuthStateExpiry(1_000)).toBe(601_000);
  });

  it("strips persisted oauth tokens from returned connection objects", () => {
    expect(
      sanitizeSpotifyConnection({
        accessToken: "secret-access",
        refreshToken: "secret-refresh",
        displayName: "Listener",
      }),
    ).toEqual({
      displayName: "Listener",
    });
  });
});
