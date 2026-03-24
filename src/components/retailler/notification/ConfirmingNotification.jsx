"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { X, BellOff } from "lucide-react";
import {
  get_all_notification_retailer,
  seen_notification_retailer,
} from "../../../redux/services/retailer/notificationRetailer.service";
import {
  getAllNotificationRetailers,
  setUpdateSeenNotificationRetailer,
} from "../../../redux/slices/retailer/notification/notificationRetailerSlice";
import LoadingOverlay from "react-loading-overlay";
import { styled } from "@mui/material";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
const ConfirmingNotification = () => {
  const dispatch = useDispatch();
  const [noDataNotifications, setDataNotifications] = useState(false);
  useEffect(() => {
    get_all_notification_retailer().then((res) => {
      if (res.status === 200) {
        dispatch(getAllNotificationRetailers(res.data.data));
        setDataNotifications(false);
      } else {
        setDataNotifications(true);
      }
    });
  }, [dispatch]);
  const allDataNotificationRetailer = useSelector(
    (state) => state.DataNotificationRetailer.dataNotificationRetailer,
  );
  // ======================== handle read notifications ========================
  const [loadingPro, setLoadingPro] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dataNotification, setDataNotification] = useState([
    {
      store: "",
      image: "",
      title: "",
      description: "",
      seen: false,
      createdDate: "",
      notificationType: "",
    },
  ]);
  const handleGetDataNotification = (data) => {
    if (data.seen) {
      // console.log("Seen dataNotification", data.seen);
      setShowModal(true);
      setDataNotification(data);
    } else {
      setLoadingPro(true);
      seen_notification_retailer(data.id).then((res) => {
        if (res.status === 200) {
          dispatch(setUpdateSeenNotificationRetailer(data));
          setShowModal(true);
          setDataNotification(data);
          setLoadingPro(false);
        } else {
          toast.error("Something went wrong");
          setLoadingPro(false);
        }
      });
    }
  };
  const imageTest =
    "https://firebasestorage.googleapis.com/v0/b/wm-file-upload.appspot.com/o/download.png?alt=media&token=f3aa8608-77b4-4437-af13-993de6ac2e84";

  const StyledLoader = styled(LoadingOverlay)`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  `;
  //                ====== count notifications ORDER_CONFIRMING======

  const countAllNotificationUnseenOrderConfirming =
    allDataNotificationRetailer.filter(
      (item) => item.notificationType === "ORDER_CONFIRMING",
    ).length;
  return (
    <div className="mt-3 -mx-4 ">
      {loadingPro ? (
        <StyledLoader
          active={loadingPro}
          spinner={true}
          text="Loading..."
          className="z-50"
        ></StyledLoader>
      ) : (
        <>
          {showModal ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-auto mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex items-start justify-between p-3 border-b border-solid bg-primaryColorRetailer border-slate-200 rounded-t">
                      <h3 className="text-xl text-white font-semibold">
                        {dataNotification.notificationType === "ORDER_CANCELLED"
                          ? "Order Has Cancelled"
                          : dataNotification.notificationType === "NEW_ORDER"
                            ? "New Order"
                            : dataNotification.notificationType ===
                                "ORDER_COMPLETE"
                              ? "Order Complete"
                              : "Out of stock"}
                      </h3>
                      <button onClick={() => setShowModal(false)}>
                        <X className="h-6 w-6 text-white" />
                      </button>
                    </div>
                    {/*body*/}
                    <div className="relative p-6 flex-auto">
                      <main className="profile-page">
                        <section className="">
                          <div className="container mx-auto">
                            <div className="relative flex flex-col min-w-0 break-words bg-white w-full ">
                              <div className="">
                                <div className="flex flex-wrap justify-center">
                                  <img
                                    alt="..."
                                    src={getSafeImageSrc(
                                      dataNotification.image,
                                      imageTest,
                                    )}
                                    className="shadow-xl rounded-full align-middle border-none w-[100px] h-[100px]"
                                    onError={(e) =>
                                      applyImageFallback(e, imageTest)
                                    }
                                  />
                                </div>
                                <div className="text-center mt-6">
                                  <h3 className="text-2xl font-semibold leading-normal mb-2 mb-2 text-primaryColorRetailer">
                                    {dataNotification.store}
                                  </h3>
                                  <div className="text-sm leading-normal mt-0 mb-2 text-gray-500 font-bold uppercase">
                                    {/* <i className="fas fa-map-marker-alt mr-2 text-lg text-gray-500"></i>{" "} */}
                                    {dataNotification.title}
                                  </div>
                                  <div className="mb-2 text-gray-700 w-full">
                                    <span
                                      className={`w-[80%] mx-auto ${
                                        dataNotification.notificationType ===
                                        "OUT_OF_STOCK_NOTIFICATION"
                                          ? "text-red-500"
                                          : null
                                      }`}
                                    >
                                      {dataNotification.description}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      </main>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
            </>
          ) : null}
        </>
      )}
      {noDataNotifications || countAllNotificationUnseenOrderConfirming < 0 ? (
        <div className="h-96 w-full flex flex-col gap-2 justify-center items-center text-xl text-gray-500">
          <BellOff className="w-12 h-12 text-slate-300 mb-2" />
          No data notifications
        </div>
      ) : (
        <div className="flex flex-col gap-1 overflow-auto h-96">
          {allDataNotificationRetailer.map((item) =>
            item.notificationType === "ORDER_CONFIRMING" ? (
              <div
                key={item.id}
                className={`${
                  item.seen === false ? "bg-blue-100" : null
                } w-full rounded cursor-pointer`}
                onClick={() => handleGetDataNotification(item)}
              >
                <div className="flex mx-auto justify-evenly items-center w-[95%] py-2">
                  <img
                    src={getSafeImageSrc(item.image, imageTest)}
                    alt=""
                    className=" w-10 h-10 rounded-full"
                    onError={(e) => applyImageFallback(e, imageTest)}
                  />
                  <div className="w-72 ml-5">
                    <h2
                      className={`text-base font-medium ${
                        item.name === "Notice product unavailable"
                          ? "text-red-600"
                          : null
                      }`}
                    >
                      {item.store}
                    </h2>
                    <p
                      className={`text-xs ${
                        item.title === "Out of stock." ? "text-red-600" : null
                      }`}
                    >
                      {item.title}
                    </p>
                  </div>
                  <div className="text-sm w-5 flex justify-center">
                    {item.seen ? null : (
                      <span className="w-2 h-2 rounded-full bg-primaryColorRetailer"></span>
                    )}
                  </div>
                  <div className="text-sm w-20 flex justify-center">
                    <span>
                      {new Date(item.createdDate).toLocaleDateString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
};

export default ConfirmingNotification;
