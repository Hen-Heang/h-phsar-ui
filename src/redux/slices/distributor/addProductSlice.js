import { createSlice } from "@reduxjs/toolkit";
const addNewProSlice = createSlice({
  name: "addProduct",
  initialState: {
    data: [
      {
        id: 1,
        productName: "CocaCola",
        qty: 22,
        price: 20,
        category: "Beverage",
        discription: "cocacola is the best",
      },
    ],
  },
  reducers: {
    addNewProduct: (state, action) => {
      state.data.push({
        id: state.data.length + 1,
        productName: action.payload.productName,
        qty: action.payload.qty,
        price: action.payload.price,
        category: action.payload.category,
        discription: action.payload.discription,
      });
    },
  },
});
export const { addNewProduct } = addNewProSlice.actions;
export default addNewProSlice.reducer;
