import createGlobalAsyncRequest, { InstanceKey } from "@/api/globalAsyncRequest";
import createValueStore from "./value-store";
import { useEffect } from "react";

export default function createAsyncValueStore<E, A>(initialValue: E, getValue: () => Promise<E>) {
  const useAsyncRequest = createGlobalAsyncRequest<E, A>(getValue);
  const store = createValueStore<E>(initialValue);

  return function useAsyncRecordStore({ instance }: { instance?: InstanceKey } = {}) {
    const asyncRequest = useAsyncRequest({ instance });

    async function load(args: A, instance?: InstanceKey) {
      try {
        const value = await asyncRequest.run(args, instance);
        store.set(value);
      } catch (_) {
        // error already exposed
      }
    }

    async function loadIfNotLoaded(args: A, instance?: InstanceKey) {
      const status = asyncRequest.readStatus(instance);
      if (!status.hasRun && !status.pending && !status.error) {
        load(args, instance);
      }
    }

    function requireLoadIfNotLoaded(args: A, instance?: InstanceKey) {
      useEffect(() => {
        loadIfNotLoaded(args, instance);
      }, [args, instance]);
    }

    const status = asyncRequest.status;

    return {
      status,
      load,
      loadIfNotLoaded,
      requireLoadIfNotLoaded,
      useStore: store.useStore,
      set: store.set,
      reset: asyncRequest.reset,
    };
  };
}
