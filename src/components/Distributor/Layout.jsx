import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import HamburgerButton from "../HamburgerMenuButton/HamburgerButton";
const Layout = ({ children }) => {
  return (
    <>
      <div className="lg:h-min-screen -mt-3 lg:mt-0 bg-[#F5F5F5] ">
        <div className="grid grid-cols-12">
          <div className="lg:col-span-2 z-50 lg:z-0">
            <Sidebar />
          </div>
          <div className="lg:col-span-10 w-full col-span-12 distributor_bg h-[180vh]">
            <div className="  sm:w-full md:w-full lg:w-[90%] m-auto lg:mt-10 relative p-0 overflow-hidden">
              <div className="right-1 lg:static">
                <Navbar />
              </div>
              <div className="lg:mt-16">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
