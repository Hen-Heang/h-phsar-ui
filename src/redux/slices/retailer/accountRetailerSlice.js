import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  data: /** @type {any[]} */ ([]),
};
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    addNewProfile: (state, action) => {
      // console.log("data : ", action.payload)
      state.data.push({
        fname: action.payload.fname,
        lname: action.payload.lname,
        gender: action.payload.gender,
        address: action.payload.address,
        image: action.payload.image,
        phone: action.payload.phone,
        email: action.payload.email,
      });
    },
  },
});

export const { addNewProfile } = profileSlice.actions;
export default profileSlice.reducer;
