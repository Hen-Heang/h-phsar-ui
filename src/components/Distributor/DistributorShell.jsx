"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DistributorShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors flex">
      {/* Sidebar - Fixed width on desktop */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header / Sidebar handled inside Sidebar.jsx and Navbar.jsx usually, 
            but we need a way to trigger mobile menu if Navbar doesn't handle it. */}
        <Navbar />
        
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
