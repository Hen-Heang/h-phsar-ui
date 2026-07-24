import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  data: /** @type {any[]} */ ([]),
};
const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    addNewAccount: (state, action) => {
      // console.log("data : ", action.payload)
      state.data = action.payload;
    },
    getAccountDistributer: (state, action) => {
      state.data = action.payload;
    },
    // updateAccountDistributor:(state, action)=>{
    //     state.data = (action.payload)
    // }
  },
});

export const {
  addNewAccount,
  getAccountDistributer,
  updateAccountDistributor,
} = accountSlice.actions;
export default accountSlice.reducer;
