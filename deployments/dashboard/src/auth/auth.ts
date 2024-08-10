import { createMegalithApiEndpointInfo, makeApiRequest } from "@/api/apiRequest";
import { TokenManager } from "./token-manager";
import createValueStore from "@/data/value-store";

const AuthTokenManager = new TokenManager("auth_token");
const RefreshTokenManager = new TokenManager("refresh_token");

type AuthContext = ({ loggedIn: true; roles: string[] } | { loggedIn: false }) & {
  loading?: boolean;
};

const DEFAULT_AUTH_STATE: AuthContext = {
  loggedIn: false,
};
const store = createValueStore<AuthContext>(DEFAULT_AUTH_STATE);

const tokenPayloadValidator = (a: unknown): a is { token: string } =>
  typeof a === "object" && typeof (a as Record<string, unknown>).token === "string";

// Unauthenticated as the refresh token will be passed instead
const refreshEndpoint = createMegalithApiEndpointInfo("auth/refresh", "POST", { unauth: true });

/**
 * Uses the refresh token to update the auth token
 */
async function refreshAuthToken() {
  console.log("Beginning token refresh");
  const { token } = await makeApiRequest<{ token: string }>(refreshEndpoint, tokenPayloadValidator, {
    headers: { Authorization: `Refresh ${RefreshTokenManager.get()}` },
  });

  AuthTokenManager.set(token);
  console.log("Updated auth token");
}

const loginEndpoint = createMegalithApiEndpointInfo("login", "POST", { unauth: true });

/**
 * Exchange credentials for a refresh token
 */
async function login({ username, password }: { username: string; password: string }) {
  console.log("Logging in");
  const { token } = await makeApiRequest<{ token: string }>(loginEndpoint, tokenPayloadValidator, {
    body: {
      username,
      password,
    },
  });

  RefreshTokenManager.set(token);
  console.log("Set refresh token");

  await refreshAuthToken();
  store.set({ loggedIn: true, roles: ["Internal"] });
}

async function logout() {
  RefreshTokenManager.clear();
  AuthTokenManager.clear();
  store.set({ loggedIn: false });
}

function getToken(): string | undefined {
  return AuthTokenManager.get();
}

function getRefreshToken(): string | undefined {
  return RefreshTokenManager.get();
}

async function initializeAuthStore() {
  if (store.get().loading) {
    console.log("Ignoring call to initializeAuthStore because loading");
    return;
  }

  console.log("Starting auth");
  if (RefreshTokenManager.get()) {
    store.set({ loggedIn: false, loading: true });
    try {
      await refreshAuthToken();
      store.set({ loggedIn: true, roles: ["Internal"] });
    } catch (e) {
      console.log("Failed to refresh auth token");
      store.set({ loggedIn: false });
      throw e;
    }
  } else {
    store.set({ loggedIn: false });
  }
}

const AuthManager = {
  store,
  getToken,
  getRefreshToken,
  login,
  logout,
};

initializeAuthStore();

export { AuthManager };
