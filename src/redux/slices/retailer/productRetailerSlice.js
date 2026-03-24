import { createSlice } from "@reduxjs/toolkit/dist";
import Sprite from "../../../assets/images/retailer/sprite.png";
const productRetailerSlice = createSlice({
  name: "retailerProduct",
  initialState: {
    productRetailer: [
      {
        id: 1,
        image: Sprite,
        productName: "Sprite",
        unitPrice: "12",
        stock: "23",
      },
      {
        id: 2,
        image: Sprite,
        productName: "SoyMilk",
        unitPrice: "12",
        stock: "29",
      },
      {
        id: 3,
        image: Sprite,
        productName: "Coca",
        unitPrice: "12",
        stock: "28",
      },
      {
        id: 4,
        image: Sprite,
        productName: "Coca",
        unitPrice: "12",
        stock: "15",
      },
      {
        id: 5,
        image: Sprite,
        productName: "Coca",
        unitPrice: "12",
        stock: "23",
      },
      {
        id: 6,
        image: Sprite,
        productName: "Coca",
        unitPrice: "12",
        stock: "40",
      },
      {
        id: 7,
        image: Sprite,
        productName: "Coca",
        unitPrice: "12",
        stock: "5",
      },
      {
        id: 8,
        image: Sprite,
        productName: "Coca",
        unitPrice: "12",
        stock: "19",
      },
      {
        id: 9,
        image: Sprite,
        productName: "Coca",
        unitPrice: "12",
        stock: "14",
      },
      {
        id: 10,
        image: Sprite,
        productName: "SoyMilk",
        unitPrice: "15",
        stock: "19",
      },
      {
        id: 11,
        image: Sprite,
        productName: "Coffee",
        unitPrice: "15",
        stock: "29",
      },
      {
        id: 12,
        image: Sprite,
        productName: "Tea",
        unitPrice: "15",
        stock: "64",
      },
      {
        id: 13,
        image: Sprite,
        productName: "Water",
        unitPrice: "10",
        stock: "50",
      },
      {
        id: 14,
        image: Sprite,
        productName: "Pepsi",
        unitPrice: "14",
        stock: "20",
      },
      {
        id: 15,
        image: Sprite,
        productName: "Fanta",
        unitPrice: "21",
        stock: "30",
      },
      {
        id: 16,
        image: Sprite,
        productName: "Fanta",
        unitPrice: "35",
        stock: "27",
      },
    ],
  },
  reducers: {
    // getAllProductRetailer:(state,action) => {
    //   state.productRetailer = action.payload
    // }
  },
});
// export const {getAllProductRetailer} = productRetailerSlice.actions
export default productRetailerSlice.reducer;
