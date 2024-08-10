import React from "react";
import { Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import RequireAuth from "./auth/RequireAuth";

import HomePage from "./pages/Home";

import Page404 from "./pages/404";
import LoginPage from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />


          <Route path="*" element={<Page404 />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
