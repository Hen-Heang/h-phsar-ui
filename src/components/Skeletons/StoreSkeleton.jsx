import React from "react";
import { useEffect } from "react";
import { useState } from "react";

export const StoreSkeleton = () => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(true);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000); // Delay of 500 milliseconds

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="bg-white h-screen rounded-sm w-full sm:shadow-md ">
    {/* div1 */}
    <div className=" py-4 flex sm:px-12 lg:px-12 m-auto flex-row justify-start gap-7">
<div className="">
<div className=" flex animate-pulse rounded justify-center items-center bg-gray-300 w-36 h-36 lg:w-48 lg:h-48  border border-gray-300">
{/* replace here */}
<svg
            className="w-12 h-12 text-gray-200"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 640 512"
          >
            <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
          </svg>

          </div>
</div>
        <div className="w-full ">
         <div className="py-12 lg:px-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-sm dark:bg-gray-700  max-w-[180px] mb-2.5"></div>
          <div className="h-6 bg-gray-200 rounded-sm dark:bg-gray-700  max-w-[280px] mb-2.5"></div>

          </div>
         </div>
          
          {/* <div className="w-full animate-pulse px-12">
              <div className="h-7 bg-gray-200 rounded-sm dark:bg-gray-700  max-w-[180px] mb-2.5"></div>

            </div> */}
         
        
        </div>
    
    {/* div2 */}
    <div className="w-full  p-2 md:space-y-2 sm:px-12 sm:py-2 ">
      {/* Store image and Name*/}

      <div
        role="status"
        className="space-y-2 animate-pulse md:space-y-0 md:space-x-8 md:flex md:items-center"
      >
        {/* longline */}
        <div className="w-full">
          <div className="h-2 bg-gray-200 rounded-sm dark:bg-gray-700 mb-2.5"></div>
        </div>

        <span className="sr-only">Loading...</span>
      </div>
    </div>

    {/* div3 */}
    <div className="w-full p-6 space-y-1 md:space-y-1 sm:px-12 sm:py-12 ">
      {/* Store image and Name*/}

      <div
        role="status"
        className="space-y-2 animate-pulse md:space-y-0 md:space-x-8 md:flex "
      >
        {/* <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96 dark:bg-gray-700">
        <div className="w-full">
          <div className="h-7 bg-gray-200 rounded-md dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
          <div className="h-7 bg-gray-200 rounded-md dark:bg-gray-700 max-w-[480px] mb-2.5"></div>

        </div>
        </div> */}
       {/* <div className="w-full ">
          <div className="h-7 bg-gray-300 rounded-sm dark:bg-gray-700 sm:max-w-[160px] lg:max-w-[360px] mb-2.5"></div>
          <div className="h-7 bg-gray-300 rounded-sm dark:bg-gray-700 sm:max-w-[280px] lg:max-w-[480px] mb-2.5"></div>
        </div>

        <div className="w-full">
          <div className="h-2 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[80px] mb-2.5"></div>
          <div className="h-10 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
          <div className="h-2 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[80px] mb-3.5"></div>
          <div className="h-10 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
          <div className="h-2 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[80px] mb-3.5"></div>
          <div className="h-20 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
        </div> */}
        <div className="w-full sm:w-2/4 lg:w-full ">
          <div className="h-7 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[60px] sm:max-w-[160px] lg:max-w-[360px] mb-2.5"></div>
          <div className="h-7 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[180px] sm:max-w-[280px] lg:max-w-[480px] mb-2.5"></div>
        </div>

        <div className="w-full sm:w-full  sm:px-16 lg:px-0 lg:w-full ">
          <div className="h-2 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[80px] mb-2.5"></div>
          <div className="h-10 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
          <div className="h-2 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[80px] mb-3.5"></div>
          <div className="h-10 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
          <div className="h-2 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[80px] mb-3.5"></div>
          <div className="h-20 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
        </div>

        <span className="sr-only">Loading...</span>
      </div>
      {/* longline 2*/}
      <div className="w-full ">
        <div className="h-2 bg-gray-200 rounded-sm dark:bg-gray-700 mb-5"></div>
      </div>
      {/* section2 */}
      <div
        role="status"
        className="space-y-2 flex lg:w-full animate-pulse md:space-y-0 md:space-x-8 flex-col sm:flex-row "
      >
        {/* <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96 dark:bg-gray-700">
        <div className="w-full">
          <div className="h-7 bg-gray-200 rounded-md dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
          <div className="h-7 bg-gray-200 rounded-md dark:bg-gray-700 max-w-[480px] mb-2.5"></div>

        </div>
        </div> */}
        
        <div className="w-full sm:w-2/4 lg:w-full ">
          <div className="h-7 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[60px] sm:max-w-[160px] lg:max-w-[360px] mb-2.5"></div>
          <div className="h-7 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[180px] sm:max-w-[280px] lg:max-w-[480px] mb-2.5"></div>
        </div>

        <div className="w-full sm:w-full  sm:px-16 lg:px-0 lg:w-full ">
          <div className="h-2 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[80px] mb-2.5"></div>
          <div className="h-10 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
          <div className="h-2 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[80px] mb-3.5"></div>
          <div className="h-10 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
        </div>

      </div>
      {/* longline 3*/}
      <div className="w-full ">
        <div className="h-2 bg-gray-200 rounded-sm dark:bg-gray-700 mb-5"></div>
      </div>
      {/* section3 */}
      <div
        role="status"
        className="space-y-2 animate-pulse md:space-y-0 md:space-x-8 md:flex "
      >
        {/* <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded sm:w-96 dark:bg-gray-700">
        <div className="w-full">
          <div className="h-7 bg-gray-200 rounded-md dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
          <div className="h-7 bg-gray-200 rounded-md dark:bg-gray-700 max-w-[480px] mb-2.5"></div>

        </div>
        </div> */}
        <div className="w-2/4 ">
          <div className="h-7 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
          <div className="h-7 bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
        </div>
        
        
        <div className="flex sm:flex-row ">
        <div className="w-1/3">
          <div className="h-28 w-28 sm:h-32 sm:w-32 flex justify-center items-center bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[360px] mb-2.5">
            {" "}
            <svg
              className="w-12 h-12 text-gray-200"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 640 512"
            >
              <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
            </svg>
          </div>
        </div>
       <div className="lg:2/3 px-6">
            {/*  sm:w-2/3 */}
          <div className="h-32 w-48 sm:h-32 sm:w-72 animate-pulse bg-gray-300 rounded-sm dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
       </div>
        </div>
      </div>
    </div>
  </div>
  );
};
