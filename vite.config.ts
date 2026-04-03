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
          "chat-experience-",
          "code-highlighting-",
          "content-rendering-",
          "credits-",
          "document-tools-",
          "immersive-",
          "library-messaging-",
          "maps-",
          "study-community-",
          "study-graph-",
          "study-upload-",
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
            id.includes("recharts") ||
            id.includes("mermaid") ||
            id.includes("/d3-") ||
            id.includes("dagre") ||
            id.includes("cytoscape")
          ) {
            return "study-graph";
          }

          if (
            id.includes("react-markdown") ||
            id.includes("remark-") ||
            id.includes("rehype-") ||
            id.includes("katex") ||
            id.includes("prismjs")
          ) {
            return "content-rendering";
          }

          if (
            id.includes("three") ||
            id.includes("@react-three") ||
            id.includes("@splinetool") ||
            id.includes("gsap")
          ) {
            return "immersive";
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
