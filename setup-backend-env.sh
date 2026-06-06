#!/bin/bash

# Backend Environment Variables Setup Script
# Run this script to set up your Convex backend environment variables.
# This script loads credentials from a local `.env` or `secrets.env` file if present,
# otherwise it uses placeholders. Do NOT commit real secrets to this repository.

echo 'Setting up Convex backend environment variables...'

# Check if Convex CLI is installed
if ! command -v npx &> /dev/null; then
    echo 'Error: npx is not installed. Please install Node.js and npm first.'
    exit 1
fi

# Load variables from secrets.env or .env if they exist
if [ -f secrets.env ]; then
    echo "Loading environment variables from secrets.env..."
    # Export variables, ignoring comments and blank lines
    export $(grep -v '^#' secrets.env | xargs)
elif [ -f .env ]; then
    echo "Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
fi

# Helper function to set convex environment variables
set_convex_env() {
    local name=$1
    local value=$2
    
    if [ -z "$value" ] || [ "$value" = "placeholder" ] || [[ "$value" == *"<YOUR_"* ]] || [[ "$value" == *"your_"* ]]; then
        echo "⚠️  Skipping $name: No valid value provided (current: '$value'). Please set it in secrets.env or .env."
    else
        echo "Setting $name..."
        npx convex env set "$name" -- "$value"
    fi
}

# Adobe API
set_convex_env "ADOBE_CLIENT_ID" "${ADOBE_CLIENT_ID:-<YOUR_ADOBE_CLIENT_ID>}"
set_convex_env "ADOBE_CLIENT_SECRET" "${ADOBE_CLIENT_SECRET:-<YOUR_ADOBE_CLIENT_SECRET>}"

# Agent Router
set_convex_env "AGENTROUTER_API_KEY" "${AGENTROUTER_API_KEY:-<YOUR_AGENTROUTER_API_KEY>}"
set_convex_env "AGENT_ROUTER_TOKEN" "${AGENT_ROUTER_TOKEN:-<YOUR_AGENT_ROUTER_TOKEN>}"

# Google Auth
set_convex_env "AUTH_GOOGLE_ID" "${AUTH_GOOGLE_ID:-<YOUR_AUTH_GOOGLE_ID>}"
set_convex_env "AUTH_GOOGLE_SECRET" "${AUTH_GOOGLE_SECRET:-<YOUR_AUTH_GOOGLE_SECRET>}"

# ByteZ API
set_convex_env "BYTEZ_API_BASE_URL" "${BYTEZ_API_BASE_URL:-https://api.bytez.com/models/v2/openai/v1}"
set_convex_env "BYTEZ_API_KEY" "${BYTEZ_API_KEY:-<YOUR_BYTEZ_API_KEY>}"

# Cerebras API
set_convex_env "CEREBRAS_API_KEY" "${CEREBRAS_API_KEY:-<YOUR_CEREBRAS_API_KEY>}"

# ConvertAPI
set_convex_env "CONVERTAPI_SECRET" "${CONVERTAPI_SECRET:-<YOUR_CONVERTAPI_SECRET>}"

# Convex Deployment name
set_convex_env "CONVEX_DEPLOYMENT" "${CONVEX_DEPLOYMENT:-<YOUR_CONVEX_DEPLOYMENT>}"

# Deepgram
set_convex_env "DEEPGRAM_API_KEY" "${DEEPGRAM_API_KEY:-<YOUR_DEEPGRAM_API_KEY>}"

# ElevenLabs
set_convex_env "ELEVENLABS_API_KEY" "${ELEVENLABS_API_KEY:-<YOUR_ELEVENLABS_API_KEY>}"

# Extractor URL
set_convex_env "EXTRACTOR_URL" "${EXTRACTOR_URL:-https://biifruu-pdf-to-json.hf.space/run/predict}"

# Gemini API
set_convex_env "GEMINI_API_KEY" "${GEMINI_API_KEY:-<YOUR_GEMINI_API_KEY>}"

# Groq API
set_convex_env "GROQ_API_KEY" "${GROQ_API_KEY:-<YOUR_GROQ_API_KEY>}"

# Hugging Face
set_convex_env "HF_TOKEN" "${HF_TOKEN:-<YOUR_HF_TOKEN>}"
set_convex_env "HUGGINGFACE_API_KEY" "${HUGGINGFACE_API_KEY:-<YOUR_HUGGINGFACE_API_KEY>}"

# Judge0
set_convex_env "JUDGE0_API_HOST" "${JUDGE0_API_HOST:-https://ce.judge0.com}"
set_convex_env "JUDGE0_API_HOST_HEADER" "${JUDGE0_API_HOST_HEADER:-judge0-ce.p.rapidapi.com}"
set_convex_env "JUDGE0_API_KEY" "${JUDGE0_API_KEY:-<YOUR_JUDGE0_API_KEY>}"

# JWKS
set_convex_env "JWKS" "${JWKS:-<YOUR_JWKS_JSON_STRING>}"

# JWT Private Key
set_convex_env "JWT_PRIVATE_KEY" "${JWT_PRIVATE_KEY:-<YOUR_JWT_PRIVATE_KEY_PEM>}"

# KIE API
set_convex_env "KIE_API_KEY" "${KIE_API_KEY:-<YOUR_KIE_API_KEY>}"

# Mistral API
set_convex_env "MISTRAL_API_KEY" "${MISTRAL_API_KEY:-<YOUR_MISTRAL_API_KEY>}"

# Music API
set_convex_env "MUSIC_API_KEY" "${MUSIC_API_KEY:-<YOUR_MUSIC_API_KEY>}"

# OpenRouter
set_convex_env "OPENROUTER_API_KEY" "${OPENROUTER_API_KEY:-<YOUR_OPENROUTER_API_KEY>}"

# Provider API
set_convex_env "PROVIDER_API_KEY" "${PROVIDER_API_KEY:-<YOUR_PROVIDER_API_KEY>}"

# Qdrant
set_convex_env "QDRANT_API_KEY" "${QDRANT_API_KEY:-<YOUR_QDRANT_API_KEY>}"
set_convex_env "QDRANT_URL" "${QDRANT_URL:-<YOUR_QDRANT_URL>}"

# Replicate
set_convex_env "REPLICATE_API_TOKEN" "${REPLICATE_API_TOKEN:-<YOUR_REPLICATE_API_TOKEN>}"

# SambaNova
set_convex_env "SAMBANOVA_API_KEY" "${SAMBANOVA_API_KEY:-<YOUR_SAMBANOVA_API_KEY>}"

# SerpAPI
set_convex_env "SERPAPI_API_KEY" "${SERPAPI_API_KEY:-<YOUR_SERPAPI_API_KEY>}"

# Site URL
set_convex_env "SITE_URL" "${SITE_URL:-http://localhost:5173}"

# Spotify
set_convex_env "SPOTIFY_CLIENT_ID" "${SPOTIFY_CLIENT_ID:-<YOUR_SPOTIFY_CLIENT_ID>}"
set_convex_env "SPOTIFY_CLIENT_SECRET" "${SPOTIFY_CLIENT_SECRET:-<YOUR_SPOTIFY_CLIENT_SECRET>}"

# Stripe
set_convex_env "STRIPE_SECRET_KEY" "${STRIPE_SECRET_KEY:-<YOUR_STRIPE_SECRET_KEY>}"
set_convex_env "STRIPE_WEBHOOK_SECRET" "${STRIPE_WEBHOOK_SECRET:-<YOUR_STRIPE_WEBHOOK_SECRET>}"

# Vite / Frontend Config
set_convex_env "VITE_BYTEZ_API_KEY" "${VITE_BYTEZ_API_KEY:-<YOUR_VITE_BYTEZ_API_KEY>}"
set_convex_env "VITE_CONVEX_URL" "${VITE_CONVEX_URL:-<YOUR_VITE_CONVEX_URL>}"
set_convex_env "VITE_HF_SPACE_ID" "${VITE_HF_SPACE_ID:-merterbak/Mistral-OCR}"
set_convex_env "VLY_APP_NAME" "${VLY_APP_NAME:-Cryonex Workspace}"
set_convex_env "VLY_OPENROUTER_API_KEY" "${VLY_OPENROUTER_API_KEY:-<YOUR_VLY_OPENROUTER_API_KEY>}"

# YouTube & ZAI
set_convex_env "YOUTUBE_API_KEY" "${YOUTUBE_API_KEY:-<YOUR_YOUTUBE_API_KEY>}"
set_convex_env "ZAI_API_KEY" "${ZAI_API_KEY:-<YOUR_ZAI_API_KEY>}"

echo "✅ Convex backend environment variable setup process completed!"
echo "If any variables were skipped, please define them in secrets.env or .env and run this script again."
