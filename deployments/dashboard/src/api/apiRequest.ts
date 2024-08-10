import { AuthManager } from "@/auth/auth";
import { constructQS, QueryArgs, PathArgs } from "./utils";

export type ApiEndpointInfo = {
  endpoint: string;
  method: string;
  unauth?: boolean;
  nullWhen404?: boolean;
};

export type ApiRequestData = { params?: PathArgs; query?: QueryArgs; body?: object; headers?: object };

export async function makeUnsafeApiRequest(endpointInfo: ApiEndpointInfo, data?: ApiRequestData): Promise<unknown> {
  let accessToken = undefined;

  if (!endpointInfo.unauth) {
    accessToken = AuthManager.getToken();

    if (!accessToken) {
      throw new Error("Access token was not available");
    }
  }

  const fullPath = constructQS({ endpoint: `/api/${endpointInfo.endpoint}`, query: data?.query, pathArgs: data?.params });
  const res = await fetch(fullPath, {
    method: endpointInfo.method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...data?.headers,
    },
    body: data?.body && JSON.stringify(data.body),
  });

  if (endpointInfo.nullWhen404 && res.status === 404) {
    return null;
  }

  const contentType = res.headers.get("Content-Type");

  if (!res.ok) {
    if (contentType?.startsWith("application/json")) {
      const errorData = await res.json();

      if (errorData.errorMessage) {
        throw new Error(errorData.errorMessage);
      }
    }

    throw new Error("Server error");
  }

  if (contentType?.startsWith("application/json")) {
    return await res.json();
  }
}

export async function makeApiRequest<O>(endpointInfo: ApiEndpointInfo, codec: (a: unknown) => a is O, data?: ApiRequestData): Promise<O> {
  const result = await makeUnsafeApiRequest(endpointInfo, data);

  if (codec(result)) {
    return result;
  }

  throw new Error("API returned invalid payload");
}

export function apiRequestFactory<I, O>(
  endpointInfo: ApiEndpointInfo,
  codec: (payload: unknown) => payload is O,
  requestFormatter?: (args: I) => ApiRequestData
) {
  async function makeRequest(args: I): Promise<O> {
    const requestData = requestFormatter?.(args) ?? undefined;
    return await makeApiRequest(endpointInfo, codec, requestData);
  }

  return makeRequest;
}

export function createMegalithApiEndpointInfo(
  megalithEndpoint: string,
  method: string,
  opts?: { nullWhen404?: boolean; unauth?: boolean }
): ApiEndpointInfo {
  return {
    endpoint: `megalith/${megalithEndpoint}`,
    method,
    ...opts,
  };
}
