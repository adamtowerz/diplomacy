import { AsyncLocalStorage } from "node:async_hooks";
import { error } from "@common/core";
import { Auth, Request, Response, NextFunction } from "@common/web-server";
import { AuthJWT } from "./auth-jwt";

export const HEADER_AUTHORIZATION = "authorization";

const authInfoStore = new AsyncLocalStorage<Auth.ReqAuthInfo>();

export function useAuthState(): Auth.ReqAuthInfo | undefined {
  return authInfoStore.getStore();
}

export async function validateAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers[HEADER_AUTHORIZATION];
  const [tokenType, token] = authHeader ? authHeader.split(" ") : [];

  if (tokenType === "Bearer") {
    let payload: { sub: string; oid: string };
    try {
      payload = (await AuthJWT.verify(token)).payload;
    } catch (e) {
      throw new error.UnauthenticatedError("Token failed", { cause: e, externalizable: true });
    }

    authInfoStore.run({ agentType: "user", oid: payload.oid, userId: payload.sub, roles: [] }, next);
  } else {
    next();
  }
}

export async function getReqAuthInfo(): Promise<Auth.ReqAuthInfo | undefined> {
  return useAuthState();
}
