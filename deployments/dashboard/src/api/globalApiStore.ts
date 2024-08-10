import { ApiEndpointInfo, ApiRequestData, makeUnsafeApiRequest } from "./apiRequest";
import createGlobalAsyncRequest, { ComponentInstanceSymbol } from "./globalAsyncRequest";

// TODO: remember what I thought the `P` generic was going to be used for
// TODO: maybe phase this out for globalAsyncRequest because it has better typings
export default function createGlobalApi<T>(endpointInfo: ApiEndpointInfo) {
  function run(): Promise<T>;
  function run(req: ApiRequestData | undefined): Promise<T>;
  function run(req: void | ApiRequestData | undefined): Promise<T> {
    return makeUnsafeApiRequest(endpointInfo, req ?? undefined) as Promise<T>;
  }

  return createGlobalAsyncRequest<T, ApiRequestData | undefined>(run);
}

export { ComponentInstanceSymbol };
