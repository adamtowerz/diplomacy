import { ROLE, useHasRole } from "./Roles";

export function useIsInternal() {
  return useHasRole(ROLE.INTERNAL);
}
