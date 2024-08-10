import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import mkcert from "vite-plugin-mkcert";

import { localApiProxy } from "@diplomacy/local-dev";

const myPlugin: () => PluginOption = () => ({
  name: "configure-server",
  configureServer(server) {
    localApiProxy(server.middlewares);
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ fastRefresh: true }), viteTsconfigPaths(), svgrPlugin(), mkcert(), myPlugin()],
  build: {
    outDir: "build",
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    https: true,
    proxy: {}, // force TLS so the proxy works
    hmr: {
      clientPort: 3000,
    },
  },
});
