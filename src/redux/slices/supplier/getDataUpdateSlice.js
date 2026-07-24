import { createSlice } from "@reduxjs/toolkit";

const getDataToUpdateProduct = createSlice({
  name: "getDataToUpdateProduct",
  initialState: {
    DataUpdateProduct: [{}],
    openFormUpdateProduct: false,
  },
  reducers: {
    getDataProduct: (state, action) => {
      // console.log("Action  : ",action.payload)
      const data = {
        product_name: action.payload.product_name,
        category: action.payload.category,
        qty: action.payload.qty,
        unit_price: action.payload.unit_price,
        description: action.payload.description,
      };
      state.DataUpdateProduct = data;
      // console.log("state : " ,data);
    },
    pushDataToPageUpdate: (state, action) => {
      // console.log("state : " ,state.DataUpdateProduct);
      state.DataUpdateProduct = action.payload;
    },
    getTrueOpenFormProduct: (state, action) => {
      state.openFormUpdateProduct = action.payload;
    },
  },
});
// const openFormUpdateProduct = createSlice({
//   name : "openFormUpdateProduct",
//   initialState : {

//   }
// })
export const { getDataProduct, getTrueOpenFormProduct } =
  getDataToUpdateProduct.actions;
export default getDataToUpdateProduct.reducer;
