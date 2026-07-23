import { createSlice } from "@reduxjs/toolkit";
// const initialState={
//     data:[],
// }
const shopSlice = createSlice({
  name: "shop",
  initialState: {
    store: /** @type {any[]} */ ([]),
  },
  reducers: {
    addNewShop: (state, action) => {
      state.store = action.payload;
    },
    getDataStore: (state, action) => {
      // console.log("action",action.payload)
      state.store = action.payload;
    },
  },
});

export const { getDataStore, addNewShop } = shopSlice.actions;
export default shopSlice.reducer;
