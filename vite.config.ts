import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  let mcpPlugin = null;

  try {
    const module = await import("@lovable.dev/mcp-js/stacks/supabase/vite");
    mcpPlugin = module.mcpPlugin;
  } catch {
    mcpPlugin = null;
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mcpPlugin ? mcpPlugin() : null,
      mode === "development" && componentTagger(),
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
