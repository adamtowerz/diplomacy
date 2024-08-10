import React from "react";
import { Outlet } from "react-router-dom";

function SingleColumnLayout() {
  return (
    <div className="md:mx-auto w-[800px] flex h-screen">
      <div className="overflow-y-auto p-4 mt-4 grow">
        <Outlet />
      </div>
    </div>
  );
}

export default SingleColumnLayout;
