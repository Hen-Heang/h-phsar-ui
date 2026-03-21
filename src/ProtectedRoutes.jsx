import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoutes() {
  const isAuth = localStorage.getItem("token");
  return isAuth ? <Outlet /> : <Navigate to="/sign-in" replace />;
}

export default ProtectedRoutes;
