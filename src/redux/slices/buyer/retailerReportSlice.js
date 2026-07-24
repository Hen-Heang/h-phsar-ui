import { createSlice } from "@reduxjs/toolkit";

const retailerReportSlice = createSlice({
  name: "retailerReport",
  initialState: {
    retailerReport: {},
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    getRetailerReport: (state, action) => {
      state.retailerReport = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { getRetailerReport, setLoading, setError } =
  retailerReportSlice.actions;
export default retailerReportSlice.reducer;
