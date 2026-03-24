import { createSlice } from "@reduxjs/toolkit";

const completeSlice = createSlice({
  name: "complete",
  initialState: {
    dataComplete: [],
    loading: false,
  },
  reducers: {
    setLoadingCompleted: (state, action) => {
      state.loading = action.payload;
    },
    getAllComplete: (state, action) => {
      state.dataComplete = action.payload;
    },
  },
});
export const { getAllComplete, setLoadingCompleted } = completeSlice.actions;
export default completeSlice.reducer;
