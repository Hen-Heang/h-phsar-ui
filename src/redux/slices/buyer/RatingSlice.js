import { createSlice } from "@reduxjs/toolkit";

const RatingSlice = createSlice({
  name: "rating",
  initialState: {
    value: 0,
  },
  reducers: {
    ratingStar: (state, action) => {
      state.value.push(action.payload);
    },
  },
});
export const { ratingStar } = RatingSlice.actions;
export default RatingSlice.reducer;
