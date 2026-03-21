import React from "react";
import { Outlet } from "react-router-dom";
import FooterRetailerComponent from "../../components/retailler/FooterRetailerComponent";
import NavBarRetailerComponent from "../../components/retailler/NavBarRetailerComponent";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-family-retailer">
      <NavBarRetailerComponent />
      <main className="relative">
        <Outlet />
      </main>
      <FooterRetailerComponent />
    </div>
  );
}
