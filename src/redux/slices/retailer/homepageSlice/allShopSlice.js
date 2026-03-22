import { createSlice } from "@reduxjs/toolkit";

const allShopSlice = createSlice({
  name: "allShopSlice",
  initialState: {
    highestRateData: [],
    dataShop: [],
    dataOneShop: [],
    dataNewShop: [],
    orderData: [],
    bookmarkData: [],
    orderHistoryData: [],
    draftData: [],
    oneShopData: [],
    productData: [],
    categoryData: [],
    storeId: null,
    cartData: [],
    productByCategoryData: [],
    productInCartData: [],
    orderInCartData: [],
    deletedProductData: [],
    productByPriceData: [],
    productByDateData: [],
    loadingStore: false,
    loadingCard: false,
    loadingCategory: false,
    loadingPrice: false,
    loadingAdded: false,
  },
  reducers: {
    setLoadingAdd: (state, action) => {
      state.loadingAdded = action.payload;
    },

    setLoadingPrice: (state, action) => {
      state.loadingPrice = action.payload;
    },

    setLoadingCategoryByShop: (state, action) => {
      state.loadingCategory = action.payload;
    },
    setLoadingCard: (state, action) => {
      state.loadingCard = action.payload;
    },
    setLoadingStore: (state, action) => {
      state.loadingStore = action.payload;
    },

    setStoreId: (state, action) => {
      state.storeId = action.payload;
      // console.log("nonononononnono",setStoreId);
    },

    getHighestRate: (state, action) => {
      // console.log("highestRateData slice: ", action.payload);
      state.highestRateData = action.payload;
    },
    getDataOneShopShow: (state, action) => {
      // console.log("one data in slice ", actioin.payload);
      state.dataOneShop = action.payload;
    },
    getDataAllShopShow: (state, action) => {
      // console.log("all shop data in slice ", action.payload);
      state.dataShop = action.payload;
    },
    getAllDataNewShop: (state, action) => {
      // console.log("getAllDataNewShop ", action.payload);
      state.dataNewShop = action.payload;
    },
    getAllDataOrder: (state, action) => {
      // console.log("getAllDataOrder ", action.payload);
      state.orderData = action.payload;
    },

    getOnlyBookmark: (state, action) => {
      // console.log("getOnlyBookmark ", action.payload);
      state.bookmarkData = action.payload;
    },

    getOrderHistory: (state, action) => {
      // console.log("getOrderHistory ", action.payload);
      state.orderHistoryData = action.payload;
    },
    getOrderDraft: (state, action) => {
      // console.log("getOrderDraft ", action.payload);
      state.draftData = action.payload;
    },

    getShopById: (state, action) => {
      // console.log("getOrderDraft ", action.payload);
      state.oneShopData = action.payload;
    },
    getAllProductByStoreId: (state, action) => {
      // console.log("getAllProductByStoreId ", action.payload);
      state.productData = action.payload;
    },
    getAllProductByCategory: (state, action) => {
      // console.log("getAllProductByCategory ", action.payload);
      state.productByCategoryData = action.payload;
    },
    getAllCategoryByStoreId: (state, action) => {
      // console.log("getAllCategoryByStoreIdfafafafa ", action.payload);
      state.categoryData = action.payload;
    },

    AddProductToCart: (state, action) => {
      const newProduct = action.payload[0];
      const existingProduct = state.productInCartData.find(
        (product) => product.productId === newProduct.productId
      );

      if (existingProduct) {
        // Update the quantity of the existing product
        existingProduct.qty = newProduct.qty;
        existingProduct.subTotal = newProduct.subTotal;
      } else {
        // Add the new product to the cart
        state.productInCartData.unshift(newProduct);
      }
    },

    getProductInCart: (state, action) => {
      // console.log("getProductInCart : ", action.payload);
      state.productInCartData = action.payload;
    },
    getOrderInCart: (state, action) => {
      state.orderInCartData = action.payload;
    },
    getProductByPrice: (state, action) => {
      // console.log("getProductByPrice gaga : ", action.payload);
      state.productByPriceData = action.payload;
    },
    getProductByDate: (state, action) => {
      // console.log("getProductByDate : ", action.payload);
      state.productByDateData = action.payload;
    },
    // deleteProductInCart reducer
    deleteProductInCart: (state, action) => {
      const itemId = action.payload;
      // state.productInCartData = state.productInCartData.map((proxyObject) =>
      //   Object.assign({}, proxyObject)
      // );

      // console.log("geageageag", state.productInCartData )
      // if (state.productInCartData !== null){

      state.productInCartData = state.productInCartData.filter(
        (item) => item.productId !== itemId
      );

      // }
    },

    checkoutProduct: (state, action) => {
      state.productInCartData = [];
    },

    cancelProductInCart: (state, action) => {
      state.productInCartData = [];
    },

    getBookmarkStore: (state, action) => {
      // console.log("getBookmarkStore : ", action.payload);
      state.bookmarkData = action.payload;
    },
    setUpdateBookmarkStore: (state, action) => {
      state.dataShop.map((item) => {
        if (item.id === action.payload.id) {
          // console.log("bookmarkStore : ",item.isBookmarked)
          // console.log("bookmarkStore payload : ",action.payload.isBookmarked)
          item.isBookmarked = !action.payload.isBookmarked;
        }
      });
    },
    setUpdateBookmarkStoreNewest: (state, action) => {
      state.dataNewShop.map((item) => {
        if (item.id === action.payload.id) {
          // console.log("bookmarkStore : ",item.isBookmarked)
          // console.log("bookmarkStore payload : ",action.payload.isBookmarked)
          item.isBookmarked = !action.payload.isBookmarked;
        }
      });
    },
    setUpdateBookmarkStoreRate: (state, action) => {
      state.highestRateData.map((item) => {
        if (item.id === action.payload.id) {
          // console.log("bookmarkStore : ",item.isBookmarked)
          // console.log("bookmarkStore payload : ",action.payload.isBookmarked)
          item.isBookmarked = !action.payload.isBookmarked;
        }
      });
    },
    // getOnlyBookmark: (state, action) => {
    //   // console.log("getOnlyBookmark ", action.payload);
    //   state.bookmarkData = action.payload;
    // },

    getOrderHistory: (state, action) => {
      // console.log("getOrderHistory ", action.payload);
      state.orderHistoryData = action.payload;
    },
    getOrderDraft: (state, action) => {
      // console.log("getOrderDraft ", action.payload);
      state.draftData = action.payload;
    },

    getShopById: (state, action) => {
      // console.log("getOrderDraft ", action.payload);
      state.oneShopData = action.payload;
    },
    getAllProductByStoreId: (state, action) => {
      // console.log("getAllProductByStoreId ", action.payload);
      state.productData = action.payload;
    },
    getAllProductByCategory: (state, action) => {
      // console.log("getAllProductByCategory ", action.payload);
      state.productByCategoryData = action.payload;
    },
    getAllCategoryByStoreId: (state, action) => {
      // console.log("getAllCategoryByStoreIdfafafafa ", action.payload);
      state.categoryData = action.payload;
    },

    AddProductToCart: (state, action) => {
      const newProduct = action.payload[0];
      const existingProduct = state.productInCartData.find(
        (product) => product.productId === newProduct.productId
      );

      if (existingProduct) {
        // Update the quantity of the existing product
        existingProduct.qty = newProduct.qty;
        existingProduct.subTotal = newProduct.subTotal;
      } else {
        // Add the new product to the cart
        state.productInCartData.unshift(newProduct);
      }
    },

    getProductInCart: (state, action) => {
      // console.log("getProductInCart : ", action.payload);
      state.productInCartData = action.payload;
    },
    getOrderInCart: (state, action) => {
      // console.log("getOrderInCart : ", action.payload);
      state.orderInCartData = action.payload;
    },
    getProductByPrice: (state, action) => {
      // console.log("getProductByPrice gaga : ", action.payload);
      state.productByPriceData = action.payload;
    },
    getProductByDate: (state, action) => {
      // console.log("getProductByDate : ", action.payload);
      state.productByDateData = action.payload;
    },
    // deleteProductInCart reducer
    deleteProductInCart: (state, action) => {
      const itemId = action.payload;
      // state.productInCartData = state.productInCartData.map((proxyObject) =>
      //   Object.assign({}, proxyObject)
      // );

      // console.log("geageageag", state.productInCartData )
      // if (state.productInCartData !== null){
      state.productInCartData = state.productInCartData.filter(
        (item) => item.productId !== itemId
      );
      // }
    },

    checkoutProduct: (state, action) => {
      state.productInCartData = [];
    },

    cancelProductInCart: (state, action) => {
      state.productInCartData = []},

    draftStore2: (state, action) => {
      state.productInCartData = [];
    },
  
    setUpdateBookmarkOneStore: (state, action) => {
        if (      state.oneShopData.id === action.payload.id) {
          // console.log("bookmarkStore : ",item.isBookmarked)
          // console.log("bookmarkStore payload : ",action.payload.isBookmarked)
          state.oneShopData.isBookmarked = !action.payload.isBookmarked;
        }
    },
  },
});

export const {
  setUpdateBookmarkOneStore,
  draftStore2,
  setUpdateBookmarkStoreRate,
  setUpdateBookmarkStoreNewest,
  getBookmarkStore,
  cancelProductInCart,
  checkoutProduct,
  getProductByDate,
  getProductByPrice,
  deleteProductInCart,
  getOrderInCart,
  getProductInCart,
  getDataOneShopShow,
  getDataAllShopShow,
  getAllDataNewShop,
  getAllDataOrder,
  getOnlyBookmark,
  getOrderHistory,
  getOrderDraft,
  getHighestRate,
  getShopById,
  getAllProductByStoreId,
  getAllCategoryByStoreId,
  setStoreId,
  AddProductToCart,
  getAllProductByCategory,
  setUpdateBookmarkStore,
  setLoadingStore,
  setLoadingCard,
  setLoadingCategoryByShop,
  setLoadingPrice,
  setLoadingAdd,
} = allShopSlice.actions;
export default allShopSlice.reducer;
