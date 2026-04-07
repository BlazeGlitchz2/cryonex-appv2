/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_VLY_APP_ID?: string;
  readonly VITE_VLY_MONITORING_URL?: string;
  // NOTE: All API keys (MISTRAL, HF, BYTEZ, GEMINI, SERPAPI, JUDGE0, etc.)
  // must be accessed server-side via Convex (process.env), NOT exposed in the
  // frontend bundle. VITE_ prefix means the value is bundled into client JS.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@zumer/snapdom";
