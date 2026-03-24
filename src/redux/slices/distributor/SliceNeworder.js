import { createSlice } from "@reduxjs/toolkit";
const newOrderSlice = createSlice({
  name: "newOrder",
  initialState: {
    items: [],
    preData: [],
  },
  reducers: {
    getAllNewOrder: (state, action) => {
      state.items = action.payload;
    },
    getAcceptOrder: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    declineOrder: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    addDataToPreparing: (state, action) => {
      state.preData.unshift(action.payload);
    },
    getPreparing: (state, action) => {
      state.preData = action.payload;
    },
    getFinished: (state, action) => {
      const itemId = action.payload;
      state.preData = state.preData.filter((item) => item.id !== itemId);
    },
  },
});
export const {
  declineOrder,
  getAllNewOrder,
  getAcceptOrder,
  getPreparing,
  getFinished,
  addDataToPreparing,
} = newOrderSlice.actions;
export default newOrderSlice.reducer;
