"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Spotify API types
export type SpotifyAlbum = {
  id: string;
  name: string;
  artists: { name: string }[];
  release_date: string;
  images: { url: string; height: number; width: number }[];
  external_urls: { spotify: string };
};

export type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string | null;
  images: { url: string }[];
  tracks: { total: number };
  external_urls: { spotify: string };
  public: boolean;
};

// Search albums using Client Credentials Flow
export const searchAlbums = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<SpotifyAlbum[]> => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Spotify API credentials are not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in the API Keys tab.");
    }

    try {
      // Get access token using Client Credentials Flow
      const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get Spotify access token");
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Search for albums
      const searchParams = new URLSearchParams({
        q: args.query,
        type: "album",
        limit: String(args.limit || 20),
        offset: String(args.offset || 0),
      });

      const searchResponse = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!searchResponse.ok) {
        throw new Error("Failed to search Spotify albums");
      }

      const searchData = await searchResponse.json();

      const albums: SpotifyAlbum[] = searchData.albums.items.map((album: any) => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map((artist: any) => ({ name: artist.name })),
        release_date: album.release_date,
        images: album.images,
        external_urls: album.external_urls,
      }));

      return albums;
    } catch (error) {
      console.error("Error searching Spotify albums:", error);
      throw new Error("Failed to search Spotify albums");
    }
  },
});

// Get authorization URL for OAuth flow
export const getAuthUrl = action({
  args: {
    redirectUri: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;

    if (!clientId) {
      throw new Error("Spotify Client ID is not configured");
    }

    const scopes = [
      "playlist-read-private",
      "playlist-modify-public",
      "playlist-modify-private",
      "user-library-read",
      "user-library-modify",
    ].join(" ");

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: args.redirectUri,
      scope: scopes,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  },
});

// Exchange authorization code for tokens
export const exchangeCode = action({
  args: {
    code: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Spotify API credentials are not configured");
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: args.code,
        redirect_uri: args.redirectUri,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange authorization code");
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  },
});

// Get user's Spotify profile
export const getUserProfile = action({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        "Authorization": `Bearer ${args.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user profile");
    }

    return await response.json();
  },
});

// Create a playlist on user's Spotify account
export const createPlaylist = action({
  args: {
    accessToken: v.string(),
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const response = await fetch(
      `https://api.spotify.com/v1/users/${args.userId}/playlists`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${args.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: args.name,
          description: args.description || "",
          public: args.isPublic ?? false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create playlist");
    }

    return await response.json();
  },
});

// Add tracks to a playlist
export const addTracksToPlaylist = action({
  args: {
    accessToken: v.string(),
    playlistId: v.string(),
    trackUris: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${args.playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${args.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: args.trackUris,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add tracks to playlist");
    }

    return await response.json();
  },
});