import { useSyncExternalStore } from "react";

export default function createValueStore<V>(initialValue: V) {
  let value: V = initialValue;

  const listenersSet = new Set<() => void>();

  function subscribe(onChange: () => void) {
    listenersSet.add(onChange);

    function unsubscribe() {
      listenersSet.delete(onChange);
    }

    return unsubscribe;
  }

  function useStore(): V {
    return useSyncExternalStore<V>(subscribe, () => value);
  }

  function trackChange() {
    Array.from(listenersSet).forEach((sub) => sub());
  }

  function set(newValue: V) {
    value = newValue;
    trackChange();
  }

  function get(): V {
    return value;
  }

  return {
    get,
    set,
    useStore,
  };
}
