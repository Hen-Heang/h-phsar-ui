import { createSlice } from "@reduxjs/toolkit";

const dispatchSlice = createSlice({
  name: "dispatch",
  initialState: {
    dispatchData: /** @type {any[]} */ ([]),
  },
  reducers: {},
});

export const { getAlldispatch, removeDisItem, getDelivered } =
  dispatchSlice.actions;
export default dispatchSlice.reducer;
