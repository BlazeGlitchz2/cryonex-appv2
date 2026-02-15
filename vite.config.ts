import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Target iOS 14+ / Safari 14+ — avoids unnecessary polyfills
    target: "es2020",
    // Enable CSS code splitting for smaller initial load on mobile
    cssCodeSplit: true,
    // Warn on large chunks (important for mobile performance)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router", "framer-motion"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tooltip",
            "lucide-react",
          ],
          convex: [
            "convex",
            "@convex-dev/auth/react",
            "@convex-dev/auth/server",
          ],
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          spline: ["@splinetool/react-spline", "@splinetool/runtime"],
          study: ["reactflow", "recharts", "react-markdown", "rehype-raw"],
        },
      },
    },
  },
});
