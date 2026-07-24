import { createSlice } from "@reduxjs/toolkit";

const inDecreaseProductSlice = createSlice({
  name: "inDecrementProduct",
  initialState: {
    counter: 0,
  },
  reducers: {
    increment: (state) => {
      state.counter += 1;
    },
    decrement: (state) => {
      if (state.counter > 0) {
        state.counter -= 1;
      }
    },
  },
});

export const { increment, decrement } = inDecreaseProductSlice.actions;
export default inDecreaseProductSlice.reducer;
