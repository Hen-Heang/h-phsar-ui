import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
  name: "searchProduct",
  initialState: {
    item: /** @type {any[]} */ ([]),
    loading: false,
    error: false,
    // item1: [],
  },
  reducers: {
    getSearchStore: (state, action) => {
      state.item = action.payload;
    },
    // getSearchCategory : (state,action)=>{
    //     console.log("slice1: ",action.paylaod)
    //     state.item1 = action.paylaod;
    // },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});
export const { getSearchStore, setLoading, setError } = searchSlice.actions;
export default searchSlice.reducer;
