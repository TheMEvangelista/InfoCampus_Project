import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      // Usa src/server.ts (wrapper de erro do SSR) como entrada do servidor.
      server: { entry: "server" },
    }),
    // O Nitro vem depois do TanStack Start e antes do React.
    nitro({
      preset: "cloudflare_module",
      cloudflare: {
        wrangler: {
          name: "infocampus",
        },
      },
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
});
