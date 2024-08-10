import React from "react";
import { Outlet } from "react-router-dom";

function FullPageLayout() {
  return (
    <div className="md:mx-auto p-4 h-screen max-h-full">
      <Outlet />
    </div>
  );
}

export default FullPageLayout;
