import React, { createContext, useState } from "react";
import DevDrawer from "./DevDrawer";

type DevDrawerPayload = {
  header: string;
  data: unknown;
};

export type DevDrawerContext = {
  payload?: DevDrawerPayload;
  setPayload: (p: DevDrawerPayload | undefined) => void;
};

export const DevDrawerContext = createContext<DevDrawerContext | undefined>(undefined);

export default function DevDrawerProvider({ children }: { children: React.ReactNode }) {
  const [payload, setPayload] = useState<DevDrawerPayload | undefined>(undefined);

  const context = {
    payload,
    setPayload,
  };
  return (
    <DevDrawerContext.Provider value={context}>
      {children}
      <DevDrawer context={context} />
    </DevDrawerContext.Provider>
  );
}
