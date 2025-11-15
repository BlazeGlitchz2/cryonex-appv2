"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// Create playlist with tracks
export const createPlaylistWithTracks = action({
  args: {
    accessToken: v.string(),
    spotifyUserId: v.string(),
    playlistName: v.string(),
    trackUris: v.array(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create playlist
    const createResponse = await fetch(
      `https://api.spotify.com/v1/users/${args.spotifyUserId}/playlists`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${args.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: args.playlistName,
          description: args.description || "Created by Cryonex AI",
          public: false,
        }),
      }
    );

    if (!createResponse.ok) {
      throw new Error("Failed to create playlist");
    }

    const playlist = await createResponse.json();

    // Add tracks to playlist
    if (args.trackUris.length > 0) {
      const addTracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
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

      if (!addTracksResponse.ok) {
        throw new Error("Failed to add tracks to playlist");
      }
    }

    return {
      id: playlist.id,
      name: playlist.name,
      url: playlist.external_urls.spotify,
      trackCount: args.trackUris.length,
    };
  },
});

// Search tracks
export const searchTracks = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Spotify API credentials not configured");
    }

    // Get access token
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

    // Search for tracks
    const searchParams = new URLSearchParams({
      q: args.query,
      type: "track",
      limit: String(args.limit || 10),
    });

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?${searchParams}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error("Failed to search Spotify tracks");
    }

    const searchData = await searchResponse.json();

    return searchData.tracks.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist: any) => artist.name).join(", "),
      album: track.album.name,
      uri: track.uri,
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
    }));
  },
});

// Get user's playlists
export const getUserPlaylists = action({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        "Authorization": `Bearer ${args.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user playlists");
    }

    const data = await response.json();

    return data.items.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      tracks_total: playlist.tracks.total,
      external_url: playlist.external_urls.spotify,
    }));
  },
});
