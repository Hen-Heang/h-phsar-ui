import { createSlice } from "@reduxjs/toolkit";
const orderSlice = createSlice({
  name: "order",
  initialState: {
    data: /** @type {any[]} */ ([]),
    dataDispatch: /** @type {any[]} */ ([]),
    loading: false,
    dataDraft: /** @type {any[]} */ ([]),
  },
  reducers: {
    setLoadingOrder: (state, action) => {
      state.loading = action.payload;
    },
    getOrderDetail: (state, action) => {
      state.data = action.payload;
    },
    // Sets the real backend status returned by the receive-confirmation call,
    // rather than fabricating one — see OrderPage.tsx's onConfirmReceipt.
    confirmTransaction: (state, action) => {
      const { id, status } = action.payload;
      state.data.forEach((item) => {
        if (item.id === id) {
          item.status = status;
        }
      });
    },
    getDraftHis: (state, action) => {
      state.dataDraft = action.payload;
    },
    deleteTheDraft: (state, action) => {
      state.dataDraft = state.dataDraft.filter(
        (item) => item.order.id !== action.payload,
      );
    },
    draftToRequest1: (state, action) => {
      const itemId = action.payload;
      // state.dataDraft = state.dataDraft
      // .map((item)=>{
      //     if(item.order.id === action.payload){
      //         item.status = "Pending"
      //     }
      // })
      state.dataDraft = state.dataDraft
        // .map((item)=>{
        //     if(item.order.id === action.payload){
        //         item.status = "Pending"
        //     }
        // })
        .filter((item) => item.order.id !== itemId);
    },
    pushToOrder: (state, action) => {
      state.data.unshift(action.payload);
    },
    deleteRequest: (state, action) => {
      state.data = state.data.filter((item) => item.id !== action.payload);
    },
  },
});
export const {
  getOrderDetail,
  confirmTransaction,
  setLoadingOrder,
  updateDispatch,
  getDraftHis,
  deleteTheDraft,
  draftToRequest1,
  pushToOrder,
  deleteRequest,
} = orderSlice.actions;
export default orderSlice.reducer;
