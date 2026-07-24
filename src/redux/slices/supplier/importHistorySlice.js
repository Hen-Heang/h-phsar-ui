import { createSlice } from "@reduxjs/toolkit";
const importHistorySlice = createSlice({
  name: "importHistory",
  initialState: {
    data: /** @type {any[]} */ ([]),
    loading: false,
  },
  reducers: {
    setLoadingHistory: (state, action) => {
      state.loading = action.payload;
    },
    getImportHistory: (state, action) => {
      state.data = action.payload;
    },
  },
});
export const { getImportHistory, setLoadingHistory } =
  importHistorySlice.actions;
export default importHistorySlice.reducer;
