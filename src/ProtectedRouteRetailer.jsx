import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRouteRetailer() {
  const role = localStorage.getItem("role");
  return role === "2" ? <Outlet /> : <Navigate to="/sign-in" replace />;
}

export default ProtectedRouteRetailer;
