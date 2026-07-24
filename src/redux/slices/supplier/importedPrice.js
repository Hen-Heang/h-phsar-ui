import { createSlice } from "@reduxjs/toolkit";
const importProSlice = createSlice({
  name: "product",
  initialState: {
    data: [
      {
        id: 1,
        productName: "Champion",
        qty: "20",
        imPrice: "$10",
      },
    ],
  },
  reducers: {
    // addNewImportProduct:(state,action)=>{
    //     state.data.push({
    //         id:state.data.length+1,
    //         productName:action.payload.productName,
    //         qty:action.payload.qty,
    //         imPrice:action.payload.imPrice,
    //     })
    // }
  },
});
// export const{addNewImportProduct}=importProSlice.actions;
export default importProSlice.reducer;
