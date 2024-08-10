import { useAuth } from "./AuthProvider";

export const ROLE = {
  INTERNAL: "Internal",
};

export type Role = typeof ROLE.INTERNAL;

export function useHasRole(role: Role) {
  const auth = useAuth();

  if (!auth.loggedIn) {
    return false;
  }

  return auth.roles.includes(role);
}
