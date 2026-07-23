import { createSlice } from "@reduxjs/toolkit";
const thePreparingSlice = createSlice({
  name: "preparing",
  initialState: {
    items: /** @type {any[]} */ ([]),
    preData: /** @type {any[]} */ ([]),
    dispatchData: /** @type {any[]} */ ([]),
  },
  reducers: {
    getAllNewOrder1: (state, action) => {
      state.items = action.payload;
    },
    getAcceptOrder1: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    declineOrder1: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    pushDataToPreparing: (state, action) => {
      state.preData.unshift(action.payload);
    },
    getAllPreparing: (state, action) => {
      state.preData = action.payload;
    },
    getFinish: (state, action) => {
      const itemId = action.payload;
      state.preData = state.preData.filter((item) => item.id !== itemId);
    },
    pushData: (state, action) => {
      state.dispatchData.unshift(action.payload);
    },
    removePreItem(state, action) {
      const itemId = action.payload;
      state.preData = state.preData.filter((item) => item.id !== itemId);
    },
    getAlldispatch1: (state, action) => {
      state.dispatchData = action.payload;
    },
    getDelivered1: (state, action) => {
      const itemId = action.payload;
      state.dispatchData = state.dispatchData.filter(
        (item) => item.id !== itemId,
      );
    },
  },
});
export const {
  getAllNewOrder1,
  getAcceptOrder1,
  pushDataToPreparing,
  declineOrder1,
  getAllPreparing,
  removePreItem,
  getFinish,
  getAlldispatch1,
  getDelivered1,
  pushData,
} = thePreparingSlice.actions;
export default thePreparingSlice.reducer;
