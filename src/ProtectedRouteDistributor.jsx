import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRouteDistributor() {
  const role = localStorage.getItem("role");
  return role === "1" ? <Outlet /> : <Navigate to="/sign-in" replace />;
}
