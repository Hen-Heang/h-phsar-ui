import { createAction, createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    dataNotification: /** @type {any[]} */ ([]),
    loadingNewOrder: false,
  },
  reducers: {
    setLoadingNewOrder: (state, action) => {
      state.loadingNewOrder = action.payload;
    },
    getAllNotificationsDistributor: (state, action) => {
      state.dataNotification = action.payload;
    },
    setUpdateDateNotification: (state, action) => {
      state.dataNotification.map((item) => {
        if (item.id === action.payload.id) {
          item.seen = true;
        }
      });
    },
    setReadAllNotificationsDistributor: (state, action) => {
      state.dataNotification.map((item) => {
        item.seen = true;
      });
    },
  },
});

export const {
  setLoadingNewOrder,
  getAllNotificationsDistributor,
  setUpdateDateNotification,
  setReadAllNotificationsDistributor,
} = notificationSlice.actions;
export default notificationSlice.reducer;
