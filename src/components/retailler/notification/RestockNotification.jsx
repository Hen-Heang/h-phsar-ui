"use client";

import React from "react";
import { useState } from "react";
import imageTest from "../../../assets/images/retailer/profileone.jpg";

const RestockNotification = () => {
  const [data, setData] = useState([
    {
      id: 1,
      image: imageTest,
      title: "Manz7 shop",
      description: "Coca Cola from manz7 shop has been restocked",
      status: "now",
    },
    {
      id: 2,
      image: imageTest,
      title: "Manz7 shop",
      description: "Coca Cola from manz7 shop has been restocked",
      status: "14m ago",
    },
    {
      id: 3,
      image: imageTest,
      title: "Manz7 shop",
      description: "Coca Cola from manz7 shop has been restocked",
      status: "14m ago",
    },
    {
      id: 4,
      image: imageTest,
      title: "Manz7 shop",
      description: "Coca Cola from manz7 shop has been restocked",
      status: "14m ago",
    },
  ]);
  return (
    <div className="mt-3 -mx-4">
      {data.map((item) => (
        <div
          className={`mt-[2px] flex  w-full h-14 px-1 ${item.status === "now" ? "bg-[#fcddd1]" : null} cursor-pointer`}
        >
          <div className="w-10 self-center">
            <img
              src={item.image}
              alt=""
              className="rounded-full align-baseline"
            />
          </div>
          <div className="flex flex-col align-middle justify-center p-2 w-60">
            <div
              className={`${item.description === "has rejected your order" ? "text-red-500" : null} font-medium text-sm`}
            >
              {item.title}
            </div>
            <div className="text-xs">{item.description}</div>
          </div>

          <div className="flex flex-col items-center justify-center px-2 ">
            <div>{item.status}</div>
            {item.status === "now" ? (
              <div>
                <div className="p-1 bg-[#F15B22] rounded-full "></div>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RestockNotification;
