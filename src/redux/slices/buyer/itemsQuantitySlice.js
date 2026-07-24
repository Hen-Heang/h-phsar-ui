import { createSlice } from "@reduxjs/toolkit";

// v2
const itemsQuantitySlice = createSlice({
  name: "itemsCounter",
  initialState: {},
  reducers: {
    increment(state, action) {
      const { productId } = action.payload;
      state[productId] = (state[productId] || 0) + 1;
    },

    decrement(state, action) {
      const { productId } = action.payload;
      if (state[productId] > 0) {
        state[productId] -= 1;
      }
    },

    set(state, action) {
      const { productId, quantity } = action.payload;
      state[productId] = quantity;
    },
  },
});

export const { increment, decrement, set } = itemsQuantitySlice.actions;
// export const selectQuantityById = (state, productId) => state.itemsCounter;
// export const selectQuantityById = (state, productId) => state.itemsCounter[productId] || 0;
export const selectQuantityById = (state) => (productId) =>
  state.itemsCounter[productId] || 0;

export default itemsQuantitySlice.reducer;
