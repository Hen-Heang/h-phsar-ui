import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import LoadingOverlay from "react-loading-overlay";
import { styled } from "@mui/material";
import {
  get_all_notification,
  read_notification_distributor,
} from "../../../redux/services/distributor/notification.service";
import {
  getAllNotificationsDistributor,
  setUpdateDateNotification,
} from "../../../redux/slices/distributor/notification/notificationSlice";
import closeWhite from "../../../assets/images/distributor/close_white.png";
import noNotification from "../../../assets/images/distributor/no_notification.png";
import fallbackAvatar from "../../../assets/images/profile_acc.png";
export const CancelNotification = () => {
  const dispatch = useDispatch();

  const [noDataNotifications,setNoDataNotifications] = useState(false)
  useEffect(() => {
    get_all_notification(dispatch).then((res) => {
      if (res.status === 404) {
        // toast.error("Something went wrong");
        setNoDataNotifications(true)
        
      } else {
        dispatch(getAllNotificationsDistributor(res.data.data));
        setNoDataNotifications(false)
        // console.log("Hellloooooo");
      }
    });
  }, []);

  const allNotifications = useSelector(
    (state) => state.allDataNotification.dataNotification
  );
  // ======================== handle read notifications ========================
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
    setLoadingPro(true);
    if (data.seen) {
      // console.log("Seen dataNotification", data.seen);
      setShowModal(true);
      setDataNotification(data);
      setLoadingPro(false);
    } else {
      read_notification_distributor(data.id).then((res) => {
        if (res.status === 200) {
          dispatch(setUpdateDateNotification(data));
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
  const StyledLoader = styled(LoadingOverlay)`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  `;
  return (
    <div>
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
                    <div className="flex items-start justify-between p-3 border-b border-solid bg-primaryColor border-slate-200 rounded-t">
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
                        <span className="h-6 w-6 z-20">
                          <img
                            src={closeWhite}
                            alt=""
                          />
                        </span>
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
                                    src={
                                      dataNotification.image === null ||
                                      dataNotification.image === ""
                                        ? fallbackAvatar
                                        : dataNotification.image
                                    }
                                    className="shadow-xl rounded-full align-middle border-none w-[100px] h-[100px]"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = fallbackAvatar;
                                    }}
                                  />
                                </div>
                                <div className="text-center mt-6">
                                  <h3 className="text-2xl font-semibold leading-normal mb-2 text-gray-800 mb-2 text-primaryColor">
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

      <div className="flex flex-col gap-1 mt-3 overflow-auto h-96 -mx-3">
      {noDataNotifications ? (
          <div className="w-full h-full">
            <div className="flex mx-auto justify-center items-center flex-col h-full gap-2">
              <img
                src={noNotification}
                className=""
                alt="loading.."
              />
              No notifications
            </div>
          </div>
        ) : (
        allNotifications.map((item) =>
          item.notificationType === "ORDER_CANCELLED" ? (
            <div
              key={item.id}
              className={`${
                item.seen === false ? "bg-blue-100" : null
              } w-full rounded-xl cursor-pointer`}
              onClick={() => handleGetDataNotification(item)}
            >
              <div className="flex mx-auto justify-evenly items-center w-[95%] py-2">
                <img
                  src={item.image || fallbackAvatar}
                  alt=""
                  className=" w-12 h-12 rounded-full"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackAvatar;
                  }}
                />
                <div className="w-72 ml-5">
                  <h2
                    className={`text-lg font-medium ${
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
                    <span className="w-2 h-2 rounded-full bg-primaryColor"></span>
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
          ) : null
        ))}
      </div>
      {/* <div className="flex flex-col gap-1 mt-3 overflow-auto h-96 ">
      <List
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      >
        {allNotifications.map((item) => (
          <ListItem  className={`${
            item.seen === false ? "bg-blue-100" : null
          } w-full rounded-xl cursor-pointer`}>
            <ListItemAvatar>
            <img src={item.image} alt="" className=" w-10 h-10 rounded-full" />
            </ListItemAvatar>
            <ListItemText primary={item.store} secondary={item.title}  className={`text-xs ${
                  item.title === "Out of stock."
                    ? "text-red-600"
                    : null
                }`}/>
          </ListItem>
        ))}
      </List>
    </div> */}
    </div>
  );
};
