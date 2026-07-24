import { createSlice } from "@reduxjs/toolkit";

const notificationRetailerSlice = createSlice({
  name: "notification-retailer",
  initialState: {
    dataNotificationRetailer: /** @type {any[]} */ ([]),
  },
  reducers: {
    getAllNotificationRetailers: (state, action) => {
      state.dataNotificationRetailer = action.payload;
    },
    setUpdateSeenNotificationRetailer: (state, action) => {
      state.dataNotificationRetailer.map((item) => {
        if (item.id === action.payload.id) {
          item.seen = true;
        }
      });
    },
    setReadAllNotificationsRetailer: (state, action) => {
      state.dataNotificationRetailer.map((item) => {
        item.seen = true;
      });
    },
    // setReadAllNotificationsRetailer: (state, action) => {
    //   state.dataNotificationRetailer.map((item)=>{
    //     item.seen = true;
    //   })
    // },
  },
});

export const {
  getAllNotificationRetailers,
  setUpdateSeenNotificationRetailer,
  setReadAllNotificationsRetailer,
} = notificationRetailerSlice.actions;
export default notificationRetailerSlice.reducer;
