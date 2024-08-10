import { useCallback, useSyncExternalStore } from "react";
import { DefaultMap } from "@/utils/defaultMap";

const AllEntriesSymbol = Symbol("AllEntriesSymbol");

export default function createRecordStore<I extends string | number | symbol, E>() {
  const store = new Map<I, E>();

  const listenersMap = new DefaultMap<I | typeof AllEntriesSymbol, (() => void)[]>(() => []);

  function subscribe(id: I | typeof AllEntriesSymbol, onChange: () => void) {
    listenersMap.get(id).push(onChange);

    function unsubscribe() {
      const listeners = listenersMap.get(id);

      listenersMap.set(
        id,
        listeners.filter((listener) => listener !== onChange)
      );
    }

    return unsubscribe;
  }

  function useStore(id: I): E | undefined {
    const sub = useCallback<Parameters<typeof useSyncExternalStore>[0]>((onStoreChange) => subscribe(id, onStoreChange), [id]);
    return useSyncExternalStore<E | undefined>(sub, () => store.get(id));
  }

  function subscribeToAllEntries(onStoreChange: () => void) {
    return subscribe(AllEntriesSymbol, onStoreChange);
  }
  let fullStoreCache: Record<I, E> = {} as Record<I, E>;
  function useFullStore(): Record<I, E> {
    return useSyncExternalStore<Record<I, E>>(subscribeToAllEntries, () => fullStoreCache);
  }

  function trackChange(id: I) {
    fullStoreCache = Object.fromEntries(store.entries()) as Record<I, E>;
    listenersMap.get(id).forEach((l) => l());
    listenersMap.get(AllEntriesSymbol).forEach((l) => l());
  }

  function set(id: I, entry: E) {
    store.set(id, entry);
    trackChange(id);
  }

  function remove(id: I) {
    store.delete(id);
    trackChange(id);
  }

  /**
   * Read value without subscribing to changes
   */
  function read(id: I): E | undefined {
    return store.get(id);
  }

  return {
    useStore,
    useFullStore,
    set,
    remove,
    read,
  };
}
