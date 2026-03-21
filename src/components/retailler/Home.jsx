import { Footer } from "flowbite-react";
import React from "react";

export default function FooterRetailerComponent() {
  return (
    // <div>
    //   <footer className="bg-[#F15B22] w-full pb-7 ">
    //     <div className="container mx-auto">
    //       <div className=" grid lg:grid-cols-3 grid-cols-2 w-full flex-wrap">

    //         <div className=" col-span-1 bg-[#F15B22] pt-14">
    //           <div className="flex flex-row ">
    //             <div className="flex flex-row  w-28 items-center">
    //               <img
    //                 src={(require("../../assets/images/retailer/whitelogo.png")?.default || require("../../assets/images/retailer/whitelogo.png"))}
    //                 alt=""
    //                 className="lg:rounded-lg lg:w-32 w-14"
    //               />
    //               <div className="text-2xl font-semibold mt-2 ml-4 text-white ">
    //                 Warehouse<br></br>Master
    //               </div>
    //             </div>
    //           </div>
    //         </div>

    //         <div className="lg:col-span-1 col-span-1 bg-[#F15B22]">
    //           <div className="flex flex-col ">
    //             <div className="flex flex-col text-white mx-auto ">
    //               <div className="font-bold py-2 mt-7 text-2xl">About Us</div>
    //               <div className="text-lg">
    //                 11th generation student of <br></br>korea software HRD
    //                 center
    //               </div>
    //               <div className="flex py-2">
    //                 <div className="w-6 mt-2">
    //                   <img
    //                     src={(require("../../assets/images/retailer/facebook.png")?.default || require("../../assets/images/retailer/facebook.png"))}
    //                     alt=""
    //                     className=""
    //                   />
    //                 </div>
    //                 <div className="w-6 mt-2 ml-2">
    //                   <img
    //                     src={(require("../../assets/images/retailer/instagram.png")?.default || require("../../assets/images/retailer/instagram.png"))}
    //                     alt=""
    //                     className=""
    //                   />
    //                 </div>
    //                 <div className="w-10 ml-2 mt-2">
    //                   <img
    //                     src={(require("../../assets/images/retailer/telegram.png")?.default || require("../../assets/images/retailer/telegram.png"))}
    //                     alt=""
    //                     className=""
    //                   />

    //                 </div>
    //               </div>
    //             </div>

    //           </div>
    //         </div>

    //         <div className=" lg:col-span-1 col-span-1  bg-[#F15B22] ">
    //           <div className="flex flex-col">
    //             <div className="flex flex-col mx-auto mt-7 ">
    //               <div className=" ml-2 font-bold  text-white text-2xl py-2">
    //                 Contact Us
    //               </div>
    //               <div className="flex items-center">
    //                 <div className="w-6 mt-2 ml-2 h-8">
    //                   <img
    //                     src={(require("../../assets/images/retailer/telephone.png")?.default || require("../../assets/images/retailer/telephone.png"))}
    //                     alt=""
    //                     className=" mr-4"
    //                   />
    //                 </div>
    //                 <div className="text-lg text-white ml-2">+855 12 850 001</div>
    //               </div>
    //               <div className="flex items-center">
    //                 <div className="w-7 mt-2 ml-2 h-8">
    //                   <img
    //                     src={(require("../../assets/images/retailer/mail.png")?.default || require("../../assets/images/retailer/mail.png"))}
    //                     alt=""
    //                     className=" "
    //                   />
    //                 </div>
    //                 <div className="text-lg text-white ml-2">
    //                   warehousemaster@gmail.com
    //                 </div>
    //               </div>
    //               <div className="flex items-center">
    //                 <div className="w-7 mt-3 ml-2 h-8 ">
    //                   <img
    //                     src={(require("../../assets/images/retailer/date.png")?.default || require("../../assets/images/retailer/date.png"))}
    //                     alt=""
    //                     className=""
    //                   />
    //                 </div>
    //                 <div className="text-lg text-white ml-2">Mon-Sun : 8am - 9pm</div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>

    //       </div>
    //     </div>

    //     <div className="text-center">
    //               <div className="pt-2 text-white text-lg">
    //                 @ 2023 warehouse master team. All rights reserved.
    //               </div>
    //             </div>
    //   </footer>
    // </div>

    <footer className="bg-primaryColorRetailer mt-32">
      <div className="w-full mx-auto container sm:pb-0 sm:py-2 lg:pt-4">
        <div className="sm:flex sm:justify-between  ">
          <div className="sm:w-1/3 lg:mb-6 sm:mb-0 lg:mt-5 sm:mt-5 ">
            <a href="#" className="flex items-center  ">
              <img
                src={(require("../../assets/images/retailer/whitelogo.png")?.default || require("../../assets/images/retailer/whitelogo.png"))}
                className="lg:h-28 lg:ml-4 sm:ml-6 lg:mr-3 sm:mt-0 mt-1 mr-1 h-16"
                alt="FlowBite Logo"
              />
              <span className="self-center lg:text-xl text-lg font-semibold whitespace-nowrap dark:text-white text-white">
                Warehouse <br /> Master
              </span>
            </a>
          </div>

          <div className="sm:w-2/3 w-full  grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-2 mt-3">
            <div className="lg:w-2/3 w-full sm:ml-1 lg:ml-0">
              <h1 className="lg:text-xl font-semibold text-white sm:text-lg text-md">
                About us
              </h1>
              <p className=" mt-2 lg:mb-4 mb-2 text-white lg:text-lg sm:text-sm text-xs w-full">
                11th generation student of korea software HRD center
              </p>
              <div className=" flex sm:mt-0">
                <a href="" className="mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-red-500 lg:h-7 h-4 fill-white"
                    viewBox="0 0 320 512"
                  >
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                  </svg>
                </a>
                <a href="" className="mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="lg:h-7 h-4 fill-white"
                  >
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                  </svg>
                </a>
                <a href="" className="mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 496 512"
                    className="lg:h-7 h-4 fill-white"
                  >
                    <path d="M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM362.952,176.66c-3.732,39.215-19.881,134.378-28.1,178.3-3.476,18.584-10.322,24.816-16.948,25.425-14.4,1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25,5.342-39.5,3.652-3.793,67.107-61.51,68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608,69.142-14.845,10.194-26.894,9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7,18.45-13.7,108.446-47.248,144.628-62.3c68.872-28.647,83.183-33.623,92.511-33.789,2.052-.034,6.639.474,9.61,2.885a10.452,10.452,0,0,1,3.53,6.716A43.765,43.765,0,0,1,362.952,176.66Z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="text-white w-full ">
              <div className="lg:text-2xl lg:ml-28 sm:ml-0">
                <h1 className="font-semibold lg:text-xl sm:text-lg text-md ">
                  Contact Us
                </h1>
                <div className="flex flex-wrap mt-2 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="lg:h-4 h-4 lg:mt-1 fill-white"
                    viewBox="0 0 512 512"
                  >
                    <path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z" />
                  </svg>
                  <p className="ml-2 lg:text-lg sm:text-sm text-xs">
                    +855 12 850 001
                  </p>
                </div>
                <div className="flex flex-wrap mt-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="lg:h-4 h-4 lg:mt-1 fill-white hidden xl:inline-block sm:inline-block"
                    viewBox="0 0 512 512"
                  >
                    <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                  </svg>
                  <p className="lg:text-lg text-xs sm:mr-5 mr-2 ml-2 hidden xl:inline-block sm:inline-block sm:text-sm ">
                    warehousems@gmail.com
                    <p className="xl:hidden sm:hidden inline-block">
                      warehouse <br /> @gmail.com
                    </p>
                  </p>
                </div>
                <div className="flex flex-wrap mt-2 lg:hidden block sm:hidden ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="lg:h-4 h-4 lg:mt-1 fill-white"
                    viewBox="0 0 512 512"
                  >
                    <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                  </svg>
                  <p className="lg:ml-2 ml-2 lg:text-lg text-xs ">
                    warehousems@ <br /> gmail.com
                  </p>
                </div>
                <div className="flex flex-wrap mt-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="lg:h-4 h-4 lg:mt-1 fill-white"
                    viewBox="0 0 448 512"
                  >
                    <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
                  </svg>
                  <p className="lg:ml-2 ml-1 lg:text-lg text-xs sm:text-sm">
                    Mon-Sun: 8am-9pm
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sm:flex sm:items-center sm:justify-between lg:mt-3 mt-5   ">
          <span className="w-full text-center text-xs text-white sm:text-center dark:text-white lg:text-lg sm:text-sm mb-5 ">
            ©2023 warehousemaster team. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

