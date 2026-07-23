import { createSlice } from "@reduxjs/toolkit";
const orderDetailSlice = createSlice({
  name: "orderDetail",
  initialState: {
    data: /** @type {any[]} */ ([]),
    dataOrder: /** @type {any[]} */ ([]),
  },
  reducers: {
    getOrderById: (state, action) => {
      state.data = action.payload;
    },
    getOrderProduct: (state, action) => {
      state.dataOrder = action.payload;
    },
  },
});
export const { getOrderById, getOrderProduct } = orderDetailSlice.actions;
export default orderDetailSlice.reducer;
