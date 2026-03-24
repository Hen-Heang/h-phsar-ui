import { createSlice } from "@reduxjs/toolkit";

const invoiceRetailerSlice = createSlice({
  name: "invoice",
  initialState: {
    data: [],
    value: [],
  },
  reducers: {
    getInvoice: (state, action) => {
      state.data = action.payload;
    },
    getOrderInvoice: (state, action) => {
      state.value = action.payload;
    },
  },
});
export const { getInvoice, getOrderInvoice } = invoiceRetailerSlice.actions;
export default invoiceRetailerSlice.reducer;
