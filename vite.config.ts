// ... keep existing code (imports and defineConfig wrapper)
        manualChunks: {
          vendor: ["react", "react-dom", "react-router", "framer-motion"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip", "lucide-react"],
          convex: ["convex", "@convex-dev/auth/react", "@convex-dev/auth/server"],
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          study: ["reactflow", "recharts", "react-markdown", "rehype-raw"],
        },
// ... keep existing code (rest of config)
