import { createSlice } from "@reduxjs/toolkit";

// create task lice
const productSlice = createSlice({
  name: "product",
  initialState: {
    product: [],
    loading: false,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // get all task
    getAllProduct: (state, action) => {
      // console.log("action : ", action.payload)
      state.product = action.payload;
      //  console.log("Action ",action)
    },
    addNewProduct: (state, action) => {
      // console.log("Payload : ", action.payload);
      // state.product.push(action.payload);
      state.product.unshift(...action.payload);
    },
    getDataToUpdateProduct: (state, action) => {
      //   state.task.push(action.payload);
    },
    deleteProductDistributor: (state, action) => {
      state.product = state.product.filter(
        (product) => product.id !== action.payload,
      );
    },
    updateProductDistributor: (state, action) => {
      state.product.map((item) => {
        // console.log("category ID : ", category.id);
        // console.log("action ID :", action.payload);
        if (item.id === action.payload.id) {
          item.name = action.payload.name;
          item.description = action.payload.description;
          item.price = action.payload.price;
          item.image = action.payload.image;
          item.category = action.payload.category;
          item.isPublish = action.payload.isPublish;
        }
      });
    },
    getProductDetail: (state, action) => {
      state.product = action.payload;
    },
    setUnpublished: (state, action) => {
      state.product.map((item) => {
        // console.log("product ID : ", item.id);
        // console.log("action payload :", action.payload);
        if (item.id === action.payload.id) {
          item.isPublish = !action.payload.isPublish;
        }
      });
    },
    addNewImportProduct: (state, action) => {
      state.product.map((item) => {
        // console.log("product ID : ", item.id);
        // console.log("action payload :", action.payload);
        if (item.id === action.payload.id) {
          // console.log("qty state : ", typeof item.qty);
          // console.log("qty payload : ", typeof parseInt(action.payload.qty));
          item.qty = item.qty + parseInt(action.payload.qty);
          item.price = action.payload.price;
        }
      });
    },
  },
});

export const {
  getAllProduct,
  getDataToUpdateProduct,
  addNewProduct,
  deleteProductDistributor,
  setLoading,
  updateProductDistributor,
  getProductDetail,
  setUnpublished,
  addNewImportProduct,
} = productSlice.actions;
export default productSlice.reducer;
