import { createSlice } from "@reduxjs/toolkit";

const invoiceDistributorSlice = createSlice({
  name: "invoiceDis",
  initialState: {
    data: [],
    dataOrder: [],
  },
  reducers: {
    getInvoiceById: (state, action) => {
      state.data = action.payload;
    },
    getInvoiceOrder: (state, action) => {
      state.dataOrder = action.payload;
    },
  },
});
export const { getInvoiceById, getInvoiceOrder } =
  invoiceDistributorSlice.actions;
export default invoiceDistributorSlice.reducer;
