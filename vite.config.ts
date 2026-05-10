import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const enableSourceMaps = process.env.VITE_ENABLE_SOURCE_MAPS === "true";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      ignored: [
        "**/android/**",
        "**/ios/**",
        "**/dist/**",
        "**/desktop-app/**",
        "**/test-results/**",
      ],
    },
  },
  optimizeDeps: {
    entries: ["index.html"],
  },
  build: {
    modulePreload: {
      resolveDependencies(_filename, deps, context) {
        if (context.hostType !== "html") {
          return deps;
        }

        const nonCriticalEntryPreloads = [
          "ai-clients-",
          "antd-",
          "charts-",
          "code-highlighting-",
          "content-rendering-",
          "document-capture-",
          "document-export-",
          "d3-",
          "gsap-",
          "chat-experience-",
          "credits-",
          "immersive-",
          "library-messaging-",
          "maps-",
          "motion-",
          "pdf-viewer-",
          "radix-",
          "spline-",
          "study-community-",
          "study-graph-",
          "study-graph-engine-",
          "study-upload-",
          "three-core-",
          "three-extras-",
          "three-react-",
          "web-llm-",
        ];

        return deps.filter(
          (dep) =>
            !nonCriticalEntryPreloads.some((prefix) =>
              dep.includes(`assets/${prefix}`),
            ),
        );
      },
    },
    // Target iOS 14+ / Safari 14+ — avoids unnecessary polyfills
    target: "es2020",
    // Enable CSS code splitting for smaller initial load on mobile
    cssCodeSplit: true,
    // Keep production sync/deploy artifacts lean for web, Android, and iOS.
    sourcemap: enableSourceMaps,
    // Warn on large chunks (important for mobile performance)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("framer-motion")) {
            return "motion";
          }

          if (id.includes("@mlc-ai/web-llm")) {
            return "web-llm";
          }

          if (
            id.includes("/node_modules/openai/") ||
            id.includes("/node_modules/ai/") ||
            id.includes("@ai-sdk/") ||
            id.includes("@google/generative-ai") ||
            id.includes("replicate") ||
            id.includes("@huggingface/inference")
          ) {
            return "ai-clients";
          }

          if (id.includes("convex") || id.includes("@convex-dev/auth")) {
            return "convex";
          }

          if (id.includes("@ionic") || id.includes("@capacitor")) {
            return "mobile-shell";
          }

          if (id.includes("@radix-ui")) {
            return "radix";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }

          if (
            id.includes("reactflow") ||
            id.includes("@reactflow") ||
            id.includes("dagre")
          ) {
            return "study-graph";
          }

          if (id.includes("cytoscape")) {
            return "study-graph-engine";
          }

          if (id.includes("recharts")) {
            return "charts";
          }

          if (id.includes("/d3-")) {
            return "d3";
          }

          if (
            id.includes("react-syntax-highlighter") ||
            id.includes("/highlight.js/") ||
            id.includes("/lowlight/")
          ) {
            return "code-highlighting";
          }

          if (
            id.includes("react-markdown") ||
            id.includes("remark-") ||
            id.includes("rehype-") ||
            id.includes("katex")
          ) {
            return "content-rendering";
          }

          if (id.includes("pdfjs-dist")) {
            return "pdf-viewer";
          }

          if (id.includes("pdf-lib") || id.includes("jspdf")) {
            return "document-export";
          }

          if (
            id.includes("html2canvas") ||
            id.includes("@zumer/snapdom")
          ) {
            return "document-capture";
          }

          if (
            id.includes("@react-three/drei") ||
            id.includes("@react-three/fiber")
          ) {
            return "three-react";
          }

          if (
            id.includes("/three/examples/") ||
            id.includes("/three/webgpu") ||
            id.includes("/three/tsl")
          ) {
            return "three-extras";
          }

          if (
            id.includes("/node_modules/three/")
          ) {
            return "three-core";
          }

          if (id.includes("@splinetool")) {
            return "spline";
          }

          if (id.includes("gsap")) {
            return "gsap";
          }

          if (id.includes("leaflet") || id.includes("react-leaflet")) {
            return "maps";
          }

          if (id.includes("/antd") || id.includes("antd-style")) {
            return "antd";
          }

          return undefined;
        },
      },
    },
  },
});
