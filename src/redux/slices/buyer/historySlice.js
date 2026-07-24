import { createSlice } from "@reduxjs/toolkit";
const historySlice = createSlice({
  name: "history",
  initialState: {
    data: /** @type {any[]} */ ([]),
    loading: false,
  },
  reducers: {
    setLoadingHistoryRetail: (state, action) => {
      state.loading = action.payload;
    },
    getAllHistory: (state, action) => {
      state.data = action.payload;
    },
  },
});
export const { getAllHistory, setLoadingHistoryRetail } = historySlice.actions;
export default historySlice.reducer;
