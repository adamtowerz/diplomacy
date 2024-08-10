import { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { isPortTaken } from "./networkUtils";
import PORT_MAPPINGS from "./portMappings";

// TODO: type as express
// TODO: support multiple backends
// TODO: support switching backends during dev server execution
const localProxy = createProxyMiddleware({
  target: "http://localhost:3010",
  changeOrigin: true,
  pathRewrite: {
    "^/api": "/",
  },
});

const remoteProxy = createProxyMiddleware({
  target: "https://deftlyapi.com",
  changeOrigin: true,
  pathRewrite: {
    "^/api": "/",
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (app: any) {
  app.use("/api", async (req: Request, res: Response, next: () => void) => {
    const path = req.originalUrl.replace("/api/", "");
    if (await isPortTaken(PORT_MAPPINGS.megalith)) {
      console.info(`Proxying (local) ${req.method} ${path}`);
      localProxy(req, res, next);
    } else {
      console.info(`Proxying (remote) ${req.method} ${path}`);
      remoteProxy(req, res, next);
    }
  });
}
