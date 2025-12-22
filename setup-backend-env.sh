#!/bin/bash

# Backend Environment Variables Setup Script
# Generated from Vly for Git Sync
# Run this script to set up your Convex backend environment variables

echo 'Setting up Convex backend environment variables...'

# Check if Convex CLI is installed
if ! command -v npx &> /dev/null; then
    echo 'Error: npx is not installed. Please install Node.js and npm first.'
    exit 1
fi

echo "Setting ADOBE_CLIENT_ID..."
npx convex env set "ADOBE_CLIENT_ID" -- "9dbe803ceb16457487cbeae937b9f1a9"

echo "Setting ADOBE_CLIENT_SECRET..."
npx convex env set "ADOBE_CLIENT_SECRET" -- "p8e-lkvw4eBx2dGAdHuFvAzxeNaChIY0DVBf"

echo "Setting AGENTROUTER_API_KEY..."
npx convex env set "AGENTROUTER_API_KEY" -- "sk-hK0e8hyt9RkhAMepW4h41k1ITIKXUgbUqtIM3lCu9CnFKC1f"

echo "Setting AGENT_ROUTER_TOKEN..."
npx convex env set "AGENT_ROUTER_TOKEN" -- "sk-hK0e8hyt9RkhAMepW4h41k1ITIKXUgbUqtIM3lCu9CnFKC1f"

echo "Setting AUTH_GOOGLE_ID..."
npx convex env set "AUTH_GOOGLE_ID" -- "793066943369-f3hu1bdo88m5p3gpapfnpadjvl5omnj6.apps.googleusercontent.com"

echo "Setting AUTH_GOOGLE_SECRET..."
npx convex env set "AUTH_GOOGLE_SECRET" -- "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"

echo "Setting BYTEZ_API_BASE_URL..."
npx convex env set "BYTEZ_API_BASE_URL" -- "https://api.bytez.com/models/v2/openai/v1"

echo "Setting BYTEZ_API_KEY..."
npx convex env set "BYTEZ_API_KEY" -- "d059b3b4f9a4e4c0e7b00f734f64355b"

echo "Setting CEREBRAS_API_KEY..."
npx convex env set "CEREBRAS_API_KEY" -- "csk-ejmk4d99nmpj3tf4r2f2v24388ddje8pjfnn43vrt84chc46"

echo "Setting CONVERTAPI_SECRET..."
npx convex env set "CONVERTAPI_SECRET" -- "Qxv53tc9Hh9tuLzGWwHeCILL769Tdhsu"

echo "Setting CONVEX_DEPLOYMENT..."
npx convex env set "CONVEX_DEPLOYMENT" -- "dev:adventurous-snake-813"

echo "Setting DEEPGRAM_API_KEY..."
npx convex env set "DEEPGRAM_API_KEY" -- "9976929aba437521f32b30af15d59fe6db004a3b"

echo "Setting ELEVENLABS_API_KEY..."
npx convex env set "ELEVENLABS_API_KEY" -- "sk_b9650bdd585e8f9a273c25cf1de96a2a291591a7554b5e08"

echo "Setting EXTRACTOR_URL..."
npx convex env set "EXTRACTOR_URL" -- "https://biifruu-pdf-to-json.hf.space/run/predict"

echo "Setting GEMINI_API_KEY..."
npx convex env set "GEMINI_API_KEY" -- "AIzaSyDboFtzNTjGvKqFsIqug6QH-fmOwAb0104"

echo "Setting GROQ_API_KEY..."
npx convex env set "GROQ_API_KEY" -- "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"

echo "Setting HF_TOKEN..."
npx convex env set "HF_TOKEN" -- "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"

echo "Setting HUGGINGFACE_API_KEY..."
npx convex env set "HUGGINGFACE_API_KEY" -- "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"

echo "Setting JUDGE0_API_HOST..."
npx convex env set "JUDGE0_API_HOST" -- "https://ce.judge0.com"

echo "Setting JUDGE0_API_HOST_HEADER..."
npx convex env set "JUDGE0_API_HOST_HEADER" -- "judge0-ce.p.rapidapi.com"

echo "Setting JUDGE0_API_KEY..."
npx convex env set "JUDGE0_API_KEY" -- "0f042cb666mshbdf59c7becb4be6p146f7ejsnd8348d61609c"

echo "Setting JWKS..."
npx convex env set "JWKS" -- "{\"keys\":[{\"use\":\"sig\",\"kty\":\"RSA\",\"n\":\"l749px1UZGEd9nJOY62r32ccwk763ZOj19v0sEltrt-UpiHL6eMPUsB_jQKLvv_GkNLgK0bre7wh_hYS33MeYyYfjL5aXXUaW_UL9Fbv8mOWTJfzbdCqUkr09UCp4kZDCFANZGwUJ7wSLpo1FYoKjd1H1ePzOw-ea5TfQOrr6ASKWBPM2CaPowB1dUs183jqjGm9sPyiiNkUr4XEJB7WloVmvvQKmM3HJt_Ugs9bHzb_M-rwcD0ZsgIwtWExaBloWxIgj1W_BxVyvGRBrxgDXBmk-nzcPmJyFVW4VvWHIZkEUQZuv0fkv_kmGFya32kzNUCMIcnVfNROWL6r7usYNQ\",\"e\":\"AQAB\"}]}"

echo "Setting JWT_PRIVATE_KEY..."
npx convex env set "JWT_PRIVATE_KEY" -- "-----BEGIN PRIVATE KEY----- MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCXvj2nHVRkYR32 ck5jravfZxzCTvrdk6PX2/SwSW2u35SmIcvp4w9SwH+NAou+/8aQ0uArRut7vCH+ FhLfcx5jJh+MvlpddRpb9Qv0Vu/yY5ZMl/Nt0KpSSvT1QKniRkMIUA1kbBQnvBIu mjUVigqN3UfV4/M7D55rlN9A6uvoBIpYE8zYJo+jAHV1SzXzeOqMab2w/KKI2RSv hcQkHtaWhWa+9AqYzccm39SCz1sfNv8z6vBwPRmyAjC1YTFoGWhbEiCPVb8HFXK8 ZEGvGANcGaT6fNw+YnIVVbhW9YchmQRRBm6/R+S/+SYYXJrfaTM1QIwhydV81E5Y vqvu6xg1AgMBAAECggEAEYOdcZeuySw1bV/JoPMnapBn7xx3E5KKH2zNi/hZrsyz B07QzqTMvLgnsLKZxxiWBlq0kYIsxVoUUVOiZ4SNvhNlIlVJME7HFVSOBexv4vnw G9SQ/fyO4BMzPUhyo0GJVKEKvqvD0sdAEP1vAZaue6vN8gfOp+M4XYHwF7nVszB/ Z1SYieBNmwRQYQZ9Y5IPGUxQFRgMBieis/OXcXei6YHP8Sx+ErkE1ZAeHno16mEx /h2WBo8cEQSFlJi0/u53mXWkFigqOjpAevpHQQ8vIVPlizusKWaM1IdGQDvUjF2n Nid2yKAq6jZNjMGj/6P/jreV6re978U1uqIFHi8T2QKBgQDQMzX9Giu1WwBMk/JX 69zwVDj/pZSwEpLGo8MmNoAJysEvaxe4tKEbKlK7ltTySmltOPCn3rCjEyv+oZBB HQZHhrnmsBJwHzMgMqv7dioW8IurlPN+554wffHr0f0JTAFL8jfXncNSeQyDoc6y 0sSQnLg5K4D/uK+s0uAlDrZtDQKBgQC6lNIJ1dPzRbGLg4vN9eTe0dNWrnWOf6ko ZpGsqBPvpC/9/1BEe2aRSAPfgv5DR2jzG+EXOnk17tTBAtNUdw4z9kGMpsc5rDXb mr4lkakSNuBco1X1xGUqVG+B+qILwi04iIwBa+yayvCrh/gBXyUdbFYuNvqxnvpi zKtwsWkdyQKBgQCySKgarKZxDhQbfzUvBNKVGgoVIH1KqRz27JTXzCOoPu9e453U lRjAYmWmLWr8b6wH05KArbkka+5ohYE5wNj3tu7KFEw1pwHouHt9QZqZOjLgIxS/ vyc+7xqSjabYpzUVC7217Wqs3OtSbOTLTKD2FL3MduxoDoagv5MhKJAeoQKBgQC3 MMsQsQtK/ZCWpG+tptIyG93ea6gsYxdY/WvmE5iPX6tnPTg4JNjNp+F1oI24zPI0 T5kvT1AXLgliAD4x3jrptc0iJdXRwE2Y8lPjWyKfKZYcHpqVlWCmsQRSoBxeYyY3 LYoZEzfZu4uVPwi3gA1W2Dm9Ymm935ODUeS53taQUQKBgB4hFVN0ZuIrfOaAPVeU NWvlbSxuJmFobuCGi4Nw2UTXehOg46VTcfqKvFAvWj+G5sOX/Zaqs2GGVqlutrWr KZMbCmQlpH1Z6oQ4z4Yi1gOu1grjb9EA0JFRT7bjpYlDYouYLFMk7XBbhBXMps9R 1pIknBgQVZUcu8kBeGkpo26W -----END PRIVATE KEY-----"

echo "Setting KIE_API_KEY..."
npx convex env set "KIE_API_KEY" -- "4d1c0e693456e144a68a59bdc439f376"

echo "Setting MISTRAL_API_KEY..."
npx convex env set "MISTRAL_API_KEY" -- "xAbL4z9dndOkKTlwUh6y1snljJ0FlmXy"

echo "Setting MUSIC_API_KEY..."
npx convex env set "MUSIC_API_KEY" -- "ee01f5371b488a7727927eb58cd43c37"

echo "Setting OPENROUTER_API_KEY..."
npx convex env set "OPENROUTER_API_KEY" -- "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"

echo "Setting PROVIDER_API_KEY..."
npx convex env set "PROVIDER_API_KEY" -- "sk-hK0e8hyt9RkhAMepW4h41k1ITIKXUgbUqtIM3lCu9CnFKC1f"

echo "Setting QDRANT_API_KEY..."
npx convex env set "QDRANT_API_KEY" -- "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.sqpA9fRFsjfO8Dg0eq1GGciz3S2tsR3r4xr5JArxrok"

echo "Setting QDRANT_URL..."
npx convex env set "QDRANT_URL" -- "https://1aee2aff-8477-469c-9913-da2a693c1f81.europe-west3-0.gcp.cloud.qdrant.io:6333"

echo "Setting REPLICATE_API_TOKEN..."
npx convex env set "REPLICATE_API_TOKEN" -- "r8_H3fiXY6BvtpKVlhaRmvbi6C1My1au9J0vxBdw"

echo "Setting SAMBANOVA_API_KEY..."
npx convex env set "SAMBANOVA_API_KEY" -- "b68af20e-3a86-4815-84e8-2c14b16fd693"

echo "Setting SERPAPI_API_KEY..."
npx convex env set "SERPAPI_API_KEY" -- "a85259acf34657db6180baba571ddcf34fd16e4cf7be614e13ca2349facb895b"

echo "Setting SITE_URL..."
npx convex env set "SITE_URL" -- "http://localhost:5173"

echo "Setting SPOTIFY_CLIENT_ID..."
npx convex env set "SPOTIFY_CLIENT_ID" -- "e08945f679d8478d9d9bf4f36e29b334"

echo "Setting SPOTIFY_CLIENT_SECRET..."
npx convex env set "SPOTIFY_CLIENT_SECRET" -- "6266064955eb49c2bb4ebd3fd09acb59"

echo "Setting STRIPE_SECRET_KEY..."
npx convex env set "STRIPE_SECRET_KEY" -- "sk_test_51SQpniRfngnYboHsj9zl7U6STY9lIQdXxKaht9NWHBexk7mocswOQtHzB77GBP3FjexJkWgy1lFrWWjbbQErYO1a00vD3GQWg2"

echo "Setting STRIPE_WEBHOOK_SECRET..."
npx convex env set "STRIPE_WEBHOOK_SECRET" -- "pk_test_51SQpniRfngnYboHsuYM0YnIymLDf2hSB4uaK8fYSiZvlHLxsfsjcPvzvGnXVSsTGt6BOyhEvOTIItcmOnl5eZqFX00CC8gos7q"

echo "Setting VITE_BYTEZ_API_KEY..."
npx convex env set "VITE_BYTEZ_API_KEY" -- "d059b3b4f9a4e4c0e7b00f734f64355b"

echo "Setting VITE_CONVEX_URL..."
npx convex env set "VITE_CONVEX_URL" -- "https://adventurous-snake-813.convex.cloud"

echo "Setting VITE_HF_SPACE_ID..."
npx convex env set "VITE_HF_SPACE_ID" -- "merterbak/Mistral-OCR"

echo "Setting VLY_APP_NAME..."
npx convex env set "VLY_APP_NAME" -- "Cryonex Workspace"

echo "Setting VLY_OPENROUTER_API_KEY..."
npx convex env set "VLY_OPENROUTER_API_KEY" -- "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"

echo "Setting YOUTUBE_API_KEY..."
npx convex env set "YOUTUBE_API_KEY" -- "AIzaSyA2R4XDxroFAxyB4qSEotAYQxxTn9HYGWo"

echo "Setting ZAI_API_KEY..."
npx convex env set "ZAI_API_KEY" -- "138ff3e49dac4eb8ab59c5f0cbf985e7.99SuMYoDXE1NULza"

echo "✅ All backend environment variables have been set!"
echo "You can now run: pnpm dev:backend"
