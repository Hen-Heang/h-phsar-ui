import React, { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import oggy from "../../../assets/images/profile_acc.png";
import noNotification from "../../../assets/images/distributor/no_notification.png";
import { get_all_notification } from "../../../redux/services/distributor/notification.service";
import { getAllNotificationsDistributor } from "../../../redux/slices/distributor/notification/notificationSlice";
export const OutofStockNotification = () => {
  const [data, setData] = useState([
    {
        id: 1,
        image: oggy,
        status: "now",
        name: "Notice product unavailable",
        title: "coca is currently out of stock",
      },
    {
        id: 2,
        image: oggy,
        status: "15m ago",
        name: "Notice product unavailable",
        title: "coca is currently out of stock",
      },
    {
        id: 3,
        image: oggy,
        status: "now",
        name: "Notice product unavailable",
        title: "coca is currently out of stock",
      },
    {
        id: 4,
        image: oggy,
        status: "15m ago",
        name: "Notice product unavailable",
        title: "coca is currently out of stock",
      },
    {
        id: 5,
        image: oggy,
        status: "15m ago",
        name: "Notice product unavailable",
        title: "coca is currently out of stock",
      },
  
   
   
  ]);

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
  const [dataNotification, setDataNotification] = useState([]);
  const handleGetDataNotification = (data) => {
    console.log("Data received : " + data);
    setDataNotification(data);
    console.log("data notification received : " + dataNotification);
    console.log("Hello world!",dataNotification.title);
  };

  return (
    <div>
    <div className="flex flex-col gap-1 mt-3 overflow-auto h-96 -mx-3">
    {noDataNotifications ? (
          <div className="w-full h-full">
            <div className="flex mx-auto justify-center items-center flex-col h-full gap-2">
              <img
                src={noNotification}
                alt="no notifications"
                className="max-w-full h-auto"
              />
              No notifications
            </div>
          </div>
        ) : (
      allNotifications.map((item) => (
        (item.notificationType === "OUT_OF_STOCK_NOTIFICATION" ? 
        <div
          key={item.id}
          className={`${
            item.seen === false ? "bg-blue-100" : null
          } w-full rounded-xl cursor-pointer`}
          onClick={() => handleGetDataNotification(item)}
        >
          <div className="flex mx-auto justify-evenly items-center w-[95%] py-2">
              <img
                src={item.image || oggy}
                alt="notification avatar"
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = oggy;
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
               : null)
      )))}
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
