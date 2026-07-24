import { createSlice } from "@reduxjs/toolkit";

const detailProductSlice = createSlice({
  name: "detailProduct",
  initialState: {
    data: /** @type {any[]} */ ([]),
  },
  reducers: {
    getDetailProduct: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { getDetailProduct } = detailProductSlice.actions;
export default detailProductSlice.reducer;
