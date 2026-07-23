import { createSlice } from "@reduxjs/toolkit";

const homeReportSlice = createSlice({
  name: "homeReport",
  initialState: {
    distributorReport: {
      month: /** @type {any[]} */ ([]),
      totalOrderEachMonth: /** @type {any[]} */ ([]),
      totalOrder: 0,
      totalProductImport: 0,
      totalProductSold: 0,
    },
  },
  reducers: {
    getDistributorReport: (state, action) => {
      state.distributorReport = action.payload;
    },
  },
});
export const { getDistributorReport } = homeReportSlice.actions;
export default homeReportSlice.reducer;
