import { createSlice } from "@reduxjs/toolkit";
const draftHistorySlice = createSlice({
  name: "draft",
  initialState: {
    data: /** @type {any[]} */ ([]),
    loading: false,
  },
  reducers: {
    setLoadingDraft: (state, action) => {
      state.loading = action.payload;
    },
    getDraftHistory: (state, action) => {
      state.data = action.payload;
    },
    getProduct: (state, action) => {
      state.data1 = action.payload;
    },
    deleteDraftHistory: (state, action) => {
      state.data = state.data
        .map((item) => {
          if (item.order.id === action.payload) {
            item.status = "Pending";
          }
        })
        .filter((item) => item.order.id !== action.payload);
    },
    draftToRequest: (state, action) => {
      const itemId = action.payload;
      state.data = state.data.filter((item) => item.order.id !== itemId);
    },
  },
});
export const {
  getDraftHistory,
  deleteDraftHistory,
  draftToRequest,
  getProduct,
  setLoadingDraft,
} = draftHistorySlice.actions;
export default draftHistorySlice.reducer;
