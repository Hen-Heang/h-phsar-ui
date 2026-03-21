import { createSlice } from "@reduxjs/toolkit";

const homeReportSlice = createSlice({

  name: "homeReport",
  initialState: {
    distributorReport: {
      month: [],
      totalOrderEachMonth: [],
      totalOrder: 0,
      totalProductImport: 0,
      totalProductSold: 0,
    },
  },
  reducers: {
    getDistributorReport: (state, action) => {
      console.log("Hello in slice", action.payload);
      state.distributorReport = action.payload;
  },
}
})
export const { getDistributorReport } = homeReportSlice.actions
export default homeReportSlice.reducer;
