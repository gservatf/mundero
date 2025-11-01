import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env": env,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "firebase-vendor": ["firebase/app", "firebase/auth"],
            "supabase-vendor": ["@supabase/supabase-js"],
            "ui-vendor": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-toast",
              "@radix-ui/react-slot",
              "@radix-ui/react-label",
            ],
            "utils-vendor": [
              "clsx",
              "tailwind-merge",
              "class-variance-authority",
            ],
          },
        },
      },
    },
  };
});
