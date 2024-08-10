import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { Toasts } from "@common/web-components";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import AuthProvider from "./auth/AuthProvider";
import DevDrawerProvider from "./devDrawer/DevDrawerProvider";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Could not find page root. HTML malformed");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
          <Toasts.ToastProvider>
            <DevDrawerProvider>
              <App />
            </DevDrawerProvider>
        </Toasts.ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
