import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loading } from "@common/web-components";
import { useAuth } from "./AuthProvider";

function RequireAuth() {
  const { loggedIn, loading } = useAuth();

  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!loggedIn) {
    console.log("Navigating to login because not logged in")
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireAuth;
