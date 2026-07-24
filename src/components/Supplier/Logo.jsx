import React from "react";
import { Package } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
        <Package className="h-6 w-6" />
      </div>
      <span className="text-xl font-black tracking-tight text-slate-900">
        H-Phsar
      </span>
    </div>
  );
};

export default Logo;
