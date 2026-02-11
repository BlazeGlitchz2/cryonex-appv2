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
    target: "es2015",
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
