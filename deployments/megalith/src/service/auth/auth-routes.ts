import { z } from "@common/type-spec";
import { error } from "@common/core";
import { createRoute } from "@common/web-server";

import { AuthJWT } from "./auth-jwt";
import { RefreshJWT } from "./refresh-jwt";

const postLogin = createRoute<{
  auth: false;
  org: false;
  body: { email: string; password: string; oid: string };
  responses: { 200: { token: string } };
}>({
  route: "/login",
  method: "POST",
  summary: "Log in and receive token",

  auth: false,
  org: false,

  body: z.object({ oid: z.string(), email: z.string(), password: z.string() }),

  responses: {
    200: {
      content: z.object({ token: z.string() }),
    },
  },

  handler: async ({ send, body: { email, password, oid } }) => {
    if (email !== "adam@deftly.co" || password !== "a" || oid !== "deftlytest-so") {
      throw new error.BadRequestError("Invalid credentials", { externalizable: true });
    }

    const token = await RefreshJWT.generate({ userId: "adam@deftly.co", oid: "deftlytest-so" });

    await send(200, { token });
  },
});

const postRefresh = createRoute<{
  auth: false;
  org: false;
  responses: { 200: { token: string } };
}>({
  route: "/auth/refresh",
  method: "POST",
  summary: "Get a new auth token using a refresh token",

  // auth is false as this checks the refresh token manually
  auth: false,
  org: false,

  responses: {
    200: {
      content: z.object({ token: z.string() }),
    },
  },

  handler: async ({ send, req }) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new error.BadRequestError("No token sent", { externalizable: true });
    }

    const [tokenType, refreshToken] = authHeader.split(" ");

    if (tokenType !== "Refresh") {
      throw new error.BadRequestError("Token type was not 'Refresh'", { externalizable: true });
    }

    if (!refreshToken) {
      throw new error.BadRequestError("No refresh token sent", { externalizable: true });
    }

    let oid, sub;
    try {
      const { payload } = await RefreshJWT.verify(refreshToken);
      oid = payload.oid;
      sub = payload.sub;
    } catch (e) {
      throw new error.ForbiddenError("Refresh token failed verification", { externalizable: true });
    }

    const token = await AuthJWT.generate({ userId: sub, oid });

    await send(200, { token });
  },
});

const getLogin = createRoute<{
  auth: true;
  org: false;
  responses: { 200: { oid: string; userId: string } };
}>({
  route: "/login",
  method: "GET",
  summary: "Get info about the logged in user",

  auth: true,
  perms: [],
  org: false,

  responses: {
    200: {
      content: z.object({ oid: z.string(), userId: z.string() }),
    },
  },

  handler: async ({ send, auth }) => {
    if (auth.agentType !== "user") {
      throw new error.BadRequestError("GET /login only accepts user tokens");
    }

    await send(200, { oid: auth.oid, userId: auth.userId });
  },
});

const AuthRoutes = [postLogin, getLogin, postRefresh];

export default AuthRoutes;
