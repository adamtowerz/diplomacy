import React, { createContext, } from "react";
import { AuthManager } from "./auth";

type AuthContext = {
  loggedIn: boolean;
  loading?: boolean;
}

const AuthContext = createContext<AuthContext>(AuthManager.store.get())

function AuthProvider({ children }: { children: React.ReactNode; }) {
  // const toasts = Toasts.useToasts();



  return <>{children}</>
}

export function useAuth() {
  // This reactively exposes the auth state from the signal rather than from context.
  const authState = AuthManager.store.useStore();

  return {
    ...AuthManager,
    store: undefined,
    ...authState,
  }
}

export default AuthProvider;
