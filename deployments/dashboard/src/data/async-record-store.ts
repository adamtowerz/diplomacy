import createGlobalAsyncRequest, { InstanceKey } from "@/api/globalAsyncRequest";
import createRecordStore from "./record-store";

export default function createAsyncRecordStore<I extends string | number | symbol, E, A>(getRecords: () => Promise<Record<I, E>>) {
  const useAsyncRequest = createGlobalAsyncRequest<Record<I, E>, A>(getRecords);
  const store = createRecordStore<I, E>();

  return function useAsyncRecordStore({ instance }: { instance?: InstanceKey } = {}) {
    const asyncRequest = useAsyncRequest({ instance });

    async function load(args: A, instance?: InstanceKey) {
      try {
        const records = await asyncRequest.run(args, instance);

        Object.entries(records).forEach(([key, value]) => {
          store.set(key as I, value as E);
        });
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

    const status = asyncRequest.status;

    return {
      status,
      load,
      loadIfNotLoaded,
      useStore: store.useStore,
      useFullStore: store.useFullStore,
      set: store.set,
      remove: store.set,
      read: store.read,
    };
  };
}
