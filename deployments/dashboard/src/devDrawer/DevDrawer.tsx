import React from "react";
import ReactDOM from "react-dom";
import { DevDrawerContext } from "./DevDrawerProvider";
import { Button, Code } from "@common/web-components";

export default function DevDrawer({ context }: { context: DevDrawerContext }) {
  const { payload, setPayload } = context;
  if (payload) {
    const drawer = (
      <div className="absolute bottom-0 w-full p-2 bg-white border-t">
        <h2 className="text-xl text-theme flex mb-2">
          {payload.header} <Button icon="close" theme="aux-action-borderless" className="ml-auto" onClick={() => setPayload(undefined)} />
        </h2>
        <Code className="whitespace-pre">{JSON.stringify(payload.data, null, 2)}</Code>
      </div>
    );

    return ReactDOM.createPortal(drawer, document.body);
  }

  return null;
}
