import React from "react";
import { Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="max-w-5xl md:mx-auto flex h-screen">
      <div className="overflow-y-auto m-4 mt-8 p-4 grow">
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
