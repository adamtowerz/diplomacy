import { RefObject, useContext } from "react";
import { DevDrawerContext } from "./DevDrawerProvider";
import useEventListener from "@/utils/useEventListener";
import { useIsInternal } from "@/auth/utils";

export default function useDevDrawer({ header, data, ref }: { header: string; data: unknown; ref: RefObject<HTMLElement> }) {
  const context = useContext(DevDrawerContext);
  const isInternal = useIsInternal();

  if (!context) {
    throw new Error("useDevDrawer cannot be called outside the DevDrawerProvider context");
  }

  function onClick(e: MouseEvent) {
    if (!isInternal) {
      return;
    }

    if (!e.altKey) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    if (!context?.payload?.data || context.payload.data !== data) {
      context?.setPayload({ header, data });
    } else {
      context.setPayload(undefined);
    }
  }

  useEventListener(ref.current, "click", onClick as EventListener);
}
