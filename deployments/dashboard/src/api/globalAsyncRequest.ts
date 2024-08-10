import { useEffect, useMemo } from "react";
import { useUniqueId } from "@common/web-components";

import createRecordStore from "@/data/record-store";
import { Status } from "@/utils/status";

const SingletonInstanceSymbol = Symbol("Singleton instance");
export const ComponentInstanceSymbol = Symbol("Component instance");

export type InstanceKey = string | symbol;

const DEFAULT_STATUS = Object.freeze({
  value: undefined,
  pending: false,
  error: undefined,
  hasRun: false,
});

export default function createGlobalAsyncRequest<T, A>(fn: (args: A) => Promise<T>) {
  const apiStore = createRecordStore<InstanceKey, Status<T>>();
  const lastRunPromiseByInstance: Record<InstanceKey, Promise<T> | undefined> = {};

  function usePrimaryInstance(instanceKey: InstanceKey | undefined) {
    let generatedInstanceKey: string | undefined;

    if (instanceKey === ComponentInstanceSymbol) {
      generatedInstanceKey = useUniqueId();
    }

    useEffect(() => {
      return () => {
        if (generatedInstanceKey) {
          apiStore.remove(generatedInstanceKey);
        }
      };
    });

    return generatedInstanceKey ?? instanceKey ?? SingletonInstanceSymbol;
  }

  // Don't destructure `instance` from `args` because it will lead to the token `instance`
  // being shadowed everywhere and potentially bugs. Or write the tests, lol.
  return function useAsyncRequest(args: { instance?: InstanceKey } = {}): {
    status: Status<T>;
    run: (args: A, instance?: InstanceKey) => Promise<T>;
    runIfNotRan: (args: A, instance?: InstanceKey) => Promise<T>;
    requireRunIfNotRan: (args: A, instance?: InstanceKey) => void;
    readStatus: (instance?: InstanceKey) => Status<T>;
    reset: (instance?: InstanceKey) => void;
  } {
    const primaryInstance = usePrimaryInstance(args.instance);
    const status: Status<T> = (apiStore.useStore(primaryInstance) as Status<T>) ?? DEFAULT_STATUS;

    async function run(args: A, instance: InstanceKey = primaryInstance): Promise<T> {
      const status = apiStore.read(instance) ?? {
        value: undefined,
        pending: false,
        error: undefined,
        hasRun: false,
      };

      try {
        apiStore.set(instance, { ...status, pending: true });
        const promise = fn(args);
        lastRunPromiseByInstance[instance] = promise;
        const result = await promise;

        apiStore.set(instance, { value: result as T, pending: false, error: undefined, hasRun: true });

        return result as T;
      } catch (error) {
        console.error(error);
        apiStore.set(instance, { value: undefined, pending: false, error: error as Error, hasRun: true });

        throw error;
      }
    }

    // TODO: support req args now that instance can provide uniqueness
    async function runIfNotRan(args: A, instance: InstanceKey = primaryInstance): Promise<T> {
      const status = apiStore.read(instance);
      if (status) {
        if (status.value !== undefined) {
          return Promise.resolve(status.value);
        }

        if (status.error) {
          return Promise.reject(status.error);
        }

        if (status.pending) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return lastRunPromiseByInstance[instance]!;
        }
      }

      return run(args);
    }

    function requireRunIfNotRan(args: A, instance: InstanceKey = primaryInstance) {
      useEffect(() => {
        runIfNotRan(args, instance);
      }, []);
    }

    function reset(instance: InstanceKey = SingletonInstanceSymbol) {
      apiStore.remove(instance);
    }

    function readStatus(instance: InstanceKey = SingletonInstanceSymbol) {
      return apiStore.read(instance) ?? DEFAULT_STATUS;
    }

    // TODO: this memo is directionally accurate but useless because all the functions
    // are re-created on run, need to use useCallback.
    // At that point should investigate whether its worth the effort to maintain referential equality..
    // it may be a perf hit but may be important for avoiding perf hits in client code even at this code's
    // expense.
    return useMemo(
      () => ({
        status,
        run,
        runIfNotRan,
        requireRunIfNotRan,
        readStatus,
        reset,
      }),
      [status]
    );
  };
}
