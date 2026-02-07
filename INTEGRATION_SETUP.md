# 🔗 Integration Setup Guide

This guide will walk you through setting up the Spotify and YouTube integrations for Cryonex.

## 🎵 Spotify Integration

### 1. Create a Spotify App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Log in with your Spotify account.
3. Click **"Create app"**.
4. Fill in the details:
   - **App name**: Cryonex (or your custom name)
   - **App description**: Personal AI Assistant Integration
   - **Redirect URI**: `http://localhost:5173/spotify-callback` (Add your production URL later too)
5. Click **"Save"**.

### 2. Get Credentials

1. In your new app's dashboard, click on **"Settings"**.
2. Find your **Client ID** and **Client Secret** (click "View client secret").

### 3. Configure Environment Variables

1. Go to your **Convex Dashboard**.
2. Navigate to **Settings** -> **Environment Variables**.
3. Add the following variables:
   - `SPOTIFY_CLIENT_ID`: (Paste your Client ID)
   - `SPOTIFY_CLIENT_SECRET`: (Paste your Client Secret)

---

## 📺 YouTube Integration

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "Cryonex Integration").

### 2. Enable YouTube Data API

1. In the sidebar, go to **APIs & Services** -> **Library**.
2. Search for **"YouTube Data API v3"**.
3. Click **"Enable"**.

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** -> **OAuth consent screen**.
2. Select **External** (or Internal if you have a Workspace org) and click **Create**.
3. Fill in required app info (App name, email).
4. Add scopes:
   - `.../auth/youtube.readonly`
   - `.../auth/youtube.force-ssl`
5. Add your email as a **Test User**.

### 4. Create Credentials

1. Go to **APIs & Services** -> **Credentials**.
2. Click **+ CREATE CREDENTIALS** -> **OAuth client ID**.
3. Select **Web application**.
4. **Authorized JavaScript origins**: `http://localhost:5173`
5. **Authorized redirect URIs**: `http://localhost:5173/youtube-callback`
6. Click **Create**.

### 5. Get Credentials & API Key

1. Copy your **Client ID** and **Client Secret**.
2. Also, create a standard **API Key** (CREATE CREDENTIALS -> API key) for search functionality.

### 6. Configure Environment Variables

1. Go to your **Convex Dashboard**.
2. Add the following variables:
   - `YOUTUBE_CLIENT_ID`: (Paste your OAuth Client ID)
   - `YOUTUBE_CLIENT_SECRET`: (Paste your OAuth Client Secret)
   - `YOUTUBE_API_KEY`: (Paste your standard API Key)

---

## ✅ Verification

1. Restart your local development server.
2. Go to **Settings** -> **Integrations**.
3. Click "Connect" on Spotify or YouTube.
4. You should be redirected to login, authorize, and then return to Cryonex with a "Connected" status!
