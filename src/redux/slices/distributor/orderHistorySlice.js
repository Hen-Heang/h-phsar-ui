import { createSlice } from "@reduxjs/toolkit";
const orderHistorySlice = createSlice({
  name: "orderHistory",
  initialState: {
    data: [],
    loading: false,
  },
  reducers: {
    setLoadingHistory: (state, action) => {
      state.loading = action.payload;
    },

    getOrderHistory: (state, action) => {
      state.data = action.payload;
    },
  },
});
export const { getOrderHistory, setLoadingHistory } = orderHistorySlice.actions;
export default orderHistorySlice.reducer;
