import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: [],
    dataStore: [],
  },
  reducers: {
    getProfile: (state, action) => {
      state.data = action.payload;
    },
    getStore: (state, action) => {
      state.dataStore = action.payload;
    },
  },
});
export const { getProfile, getStore } = profileSlice.actions;
export default profileSlice.reducer;
