/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VLY_OPENROUTER_API_KEY?: string;
  readonly VITE_BYTEZ_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GOOGLE_API_KEY?: string;
  readonly VITE_JUDGE0_API_KEY: string;
  readonly VITE_JUDGE0_API_HOST: string;
  readonly VITE_JUDGE0_API_HOST_HEADER: string;
  readonly VITE_SERPAPI_API_KEY?: string;
  readonly VITE_VLY_APP_ID?: string;
  readonly VITE_VLY_MONITORING_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@zumer/snapdom";
