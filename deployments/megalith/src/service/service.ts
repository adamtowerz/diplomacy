import config from "./config";
import Router, { Routes } from "@common/web-server";
import { Logger } from "@common/core";

import { getReqAuthInfo, validateAuth } from "./auth/auth";

import AuthRoutes from "./auth/auth-routes";

const logger = new Logger("service");

// TODO: type cast
const routes: Routes = [...AuthRoutes] as unknown as Routes;

const service = new Router(routes, {
  title: "Megalith",
  description: "All & every",
  basepath: "/megalith",
  port: Number(config.PORT), // See config-manager:readme:improvements:typed-schemas
  authMiddleware: [validateAuth],
  getReqAuthInfo,
});

await service.init();
logger.info({}, `Megalith initialized`);

export default service;
