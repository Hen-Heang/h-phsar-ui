import { createSlice } from "@reduxjs/toolkit";

const ActivityInfo = createSlice({
  name: "getActivityInfo",
  initialState: {
    data: {},
  },
  reducers: {
    getActivityInfo: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { getActivityInfo } = ActivityInfo.actions;
export default ActivityInfo.reducer;
