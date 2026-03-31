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
  build: {
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
          if (id.includes("/src/lib/curriculumPersonalization.ts")) {
            return "curriculum-personalization";
          }

          if (
            id.includes("/src/components/ui/ai-prompt-box.tsx") ||
            id.includes("/src/components/chat/NeoMessage.tsx") ||
            id.includes("/src/components/chat/ChatMessagesList.tsx")
          ) {
            return "chat-experience";
          }

          if (
            id.includes("/src/hooks/use-study-upload.ts") ||
            id.includes("/src/components/study/StudyUploadZone.tsx") ||
            id.includes("/src/components/study/MobileStudyUploadZone.tsx")
          ) {
            return "study-upload";
          }

          if (
            id.includes("/src/components/study/LocalizedStudentBrief.tsx") ||
            id.includes("/src/components/study/StudySocialSurfaces.tsx")
          ) {
            return "study-community";
          }

          if (
            id.includes("/src/components/credits/RefuelModal.tsx") ||
            id.includes("/src/components/credits/CreditIndicator.tsx")
          ) {
            return "credits";
          }

          if (
            id.includes("/src/components/ui/message.tsx") ||
            id.includes("/src/components/library/LibraryItemView.tsx")
          ) {
            return "library-messaging";
          }

          if (
            id.includes("/src/components/ui/sign-in-flow-1.tsx") ||
            id.includes("/src/components/ui/auth-fuse.tsx")
          ) {
            return "auth-ui";
          }

          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("framer-motion")) {
            return "motion";
          }

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("scheduler")
          ) {
            return "react-core";
          }

          if (id.includes("react-router")) {
            return "router";
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

          if (id.includes("@dnd-kit")) {
            return "dashboard-dnd";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }

          if (
            id.includes("@ai-sdk") ||
            id.includes("/openai/") ||
            id.includes("@google/generative-ai") ||
            id.includes("@huggingface/inference") ||
            id.includes("replicate")
          ) {
            return "ai-clients";
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
            id.includes("react-syntax-highlighter") ||
            id.includes("highlight.js")
          ) {
            return "code-highlighting";
          }

          if (
            id.includes("pdfjs-dist") ||
            id.includes("pdf-lib") ||
            id.includes("jspdf")
          ) {
            return "document-tools";
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

          if (id.includes("i18next")) {
            return "i18n";
          }

          if (id.includes("sonner")) {
            return "feedback";
          }

          if (id.includes("@lobehub")) {
            return "assistant-ui";
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
