import { createSlice } from "@reduxjs/toolkit";
const indecreaseSlice = createSlice({
  name: "counter",
  initialState: {
    counter: 0,
  },
  reducers: {
    increment: (state, action) => {
      state.counter += 1;
    },
    decrement: (state, action) => {
      state.counter -= 1;
    },
  },
});
export const { increment, decrement } = indecreaseSlice.actions;
export default indecreaseSlice.reducer;
