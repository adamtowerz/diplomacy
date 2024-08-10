import { useRef, useState } from "react";
import { makeUnsafeApiRequest, ApiEndpointInfo, ApiRequestData } from "./apiRequest";

type UseApiReturn<T> = {
  result: T | null;
  error: Error | null;
  pending: boolean;
  run: (data?: ApiRequestData) => Promise<T>;
  runIfNotRan: () => Promise<T>;
  hasRun: boolean;
};

export function createUseApi<T = unknown>(endpointInfo: ApiEndpointInfo) {
  return function useApi(): UseApiReturn<T> {
    const [result, setResult] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [pending, setPending] = useState<boolean>(false);
    const [hasRun, setHasRun] = useState<boolean>(false);
    const lastRunPromise = useRef<Promise<T> | undefined>();

    async function run(data?: ApiRequestData): Promise<T> {
      try {
        setPending(true);
        const promise = makeUnsafeApiRequest(endpointInfo, data) as Promise<T>;
        lastRunPromise.current = promise;
        const result = await promise;

        setResult(result as T);
        setError(null);
        setHasRun(true);

        return result as T;
      } catch (error) {
        setResult(null);
        setError(error as Error);
        throw error;
      } finally {
        setPending(false);
        lastRunPromise.current = undefined;
      }
    }

    async function runIfNotRan(): Promise<T> {
      if (hasRun) {
        return Promise.resolve(result as T);
      }

      if (error) {
        return Promise.reject(error);
      }

      if (pending) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return lastRunPromise.current!;
      }

      return run();
    }

    return {
      result,
      error,
      pending,
      run,
      runIfNotRan,
      hasRun,
    };
  };
}
