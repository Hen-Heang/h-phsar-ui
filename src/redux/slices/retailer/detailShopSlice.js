import { createSlice } from "@reduxjs/toolkit";

const detailShopSlice = createSlice({
  name: "detail",
  initialState: {
    data: [],
  },
  reducers: {
    getDetailShop: (state, action) => {
      state.data = action.payload;
    },
  },
});
export const { getDetailShop } = detailShopSlice.actions;
export default detailShopSlice.reducer;
