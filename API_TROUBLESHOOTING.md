# API Troubleshooting Guide

## Quick Diagnosis

If **ONLY Puter works** and all other APIs fail, check:

### 1. VITE_CONVEX_URL (Required for Bytez, Groq, AgentRouter, Z.AI)

- **Location**: Frontend environment variables (Vercel/local `.env`)
- **Format**: `https://your-project.convex.cloud`
- **How to check**: Open browser console, look for "VITE_CONVEX_URL is not configured"
- **Fix**: Set `VITE_CONVEX_URL` in your environment variables

### 2. Backend API Keys (Required in Convex Dashboard)

These must be set in **Convex Dashboard → Settings → Environment Variables**:

- `BYTEZ_API_KEY` - For Bytez models
- `GROQ_API_KEY` - For Groq models
- `AGENTROUTER_API_KEY` - For AgentRouter models
- `ZAI_API_KEY` - For Z.AI models
- `OPENROUTER_API_KEY` - For OpenRouter models (backend; frontend also needs `VLY_OPENROUTER_API_KEY`)
- `HUGGINGFACE_API_KEY` or `HF_TOKEN` - For Hugging Face models (also needs `VITE_HF_TOKEN` in frontend)

### 3. Frontend API Keys (For OpenRouter and Hugging Face)

- `VLY_OPENROUTER_API_KEY` - Set in frontend `.env` or Vercel
- `VITE_HF_TOKEN` or `VITE_HUGGINGFACE_API_KEY` - Set in frontend `.env` or Vercel

## Common Error Messages

### "VITE_CONVEX_URL not configured"

- **Meaning**: Frontend can't connect to Convex backend
- **Fix**: Set `VITE_CONVEX_URL` in environment variables
- **Affects**: Bytez, Groq, AgentRouter, Z.AI

### "API key not configured in backend"

- **Meaning**: API key missing in Convex dashboard
- **Fix**: Add the API key in Convex Dashboard → Settings → Environment Variables
- **Affects**: All APIs using Convex proxy

### "Network error: Cannot connect"

- **Meaning**: Can't reach the API endpoint
- **Possible causes**:
  - `VITE_CONVEX_URL` is wrong
  - Internet connection issue
  - Convex deployment issue

### "Invalid API key"

- **Meaning**: API key is set but incorrect
- **Fix**: Regenerate API key and update in Convex dashboard

## Testing APIs

1. **Puter** (No API key needed) - Should always work
2. **Bytez** - Needs `VITE_CONVEX_URL` + `BYTEZ_API_KEY` in Convex
3. **Groq** - Needs `VITE_CONVEX_URL` + `GROQ_API_KEY` in Convex
4. **AgentRouter** - Needs `VITE_CONVEX_URL` + `AGENTROUTER_API_KEY` in Convex
5. **Z.AI** - Needs `VITE_CONVEX_URL` + `ZAI_API_KEY` in Convex
6. **OpenRouter** - Needs `VLY_OPENROUTER_API_KEY` in frontend
7. **Hugging Face** - Needs `VITE_HF_TOKEN` in frontend

## Step-by-Step Fix

1. **Check browser console** (F12) for error messages
2. **Verify VITE_CONVEX_URL**:
   ```bash
   echo $VITE_CONVEX_URL  # Should show your Convex URL
   ```
3. **Check Convex Dashboard**:
   - Go to https://dashboard.convex.dev
   - Select your project
   - Go to Settings → Environment Variables
   - Verify all required API keys are set
4. **Redeploy** after adding environment variables
