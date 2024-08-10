import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loading } from "@common/web-components";
import { useAuth } from "./AuthProvider";
import { ROLE, useHasRole } from "./Roles";

type RequireRoleProps = {
  role: string; // TODO: support string[]
};

function RequireRole({ role }: RequireRoleProps) {
  const { loggedIn, loading } = useAuth();
  const hasRole = useHasRole(role);

  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!loggedIn) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (!hasRole) {
    return <h1>Permission denied</h1>; // TODO: improve this, lol
  }

  return <Outlet />;
}

export const RequireInternal = () => RequireRole({ role: ROLE.INTERNAL });

export default RequireRole;
