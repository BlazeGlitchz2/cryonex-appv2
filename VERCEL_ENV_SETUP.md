# Vercel Environment Variables Setup

## Required Environment Variables

To fix the black screen issue, ensure these environment variables are set in your Vercel project:

### Critical (Required for app to work)

1. **`VITE_CONVEX_URL`** - Your Convex deployment URL
   - Get this from your Convex dashboard
   - Format: `https://your-project.convex.cloud`
   - **This is critical** - without it, the app will fail to initialize

### Optional (For specific features)

2. **`VITE_OPENROUTER_API_KEY`** - For OpenRouter models
3. **`VITE_BYTEZ_API_KEY`** - For Bytez models  
4. **`VITE_HF_TOKEN`** or **`VITE_HUGGINGFACE_API_KEY`** - For Hugging Face models

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `VITE_CONVEX_URL`
   - **Value**: Your Convex URL (e.g., `https://your-project.convex.cloud`)
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for changes to take effect

## Backend Environment Variables (Convex Dashboard)

These should be set in your **Convex dashboard**, not Vercel:

- `GROQ_API_KEY` - For Groq models
- `AGENTROUTER_API_KEY` - For AgentRouter models
- `BYTEZ_API_KEY` - For Bytez models
- `OPENROUTER_API_KEY` - For OpenRouter models
- `HUGGINGFACE_API_KEY` - For Hugging Face models

## Troubleshooting

If you see a black screen:

1. **Check browser console** (F12) for errors
2. **Verify `VITE_CONVEX_URL` is set** in Vercel environment variables
3. **Check Vercel build logs** for any errors
4. **Ensure build scripts are allowed** (see VERCEL_DEPLOYMENT.md)
5. **Redeploy** after adding environment variables

## Common Issues

- **Black screen**: Usually means `VITE_CONVEX_URL` is missing or Tailwind CSS didn't build
- **API errors**: Check that backend API keys are set in Convex dashboard
- **Build failures**: Check that build scripts are allowed (see `.npmrc` and `vercel.json`)

