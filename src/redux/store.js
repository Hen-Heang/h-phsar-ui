import { configureStore } from "@reduxjs/toolkit";
import getDataUpdateSlice from "./slices/supplier/getDataUpdateSlice";
import productSlice from "./slices/supplier/productSlice";
import SliceNeworder from "./slices/supplier/SliceNeworder";
import CompleteSlice from "./slices/supplier/CompleteSlice";
import PreparingSlice from "./slices/supplier/PreparingSlice";
import DispatchSlice from "./slices/supplier/DispatchSlice";
import categorySlice from "./slices/supplier/categorySlice";
import productRetailerSlice from "./slices/buyer/productRetailerSlice";
import AccountSlice from "./slices/supplier/AccountSlice";
import storeSlice from "./slices/supplier/storeSlice";
import importedPrice from "./slices/supplier/importedPrice";
import addProductSlice from "./slices/supplier/addProductSlice";
import orderSlice from "./slices/buyer/orderSlice";
import accountRetailerSlice from "./slices/buyer/accountRetailerSlice";
import allShopSlice from "./slices/buyer/homepageSlice/allShopSlice";
import favoriteSlice from "./slices/buyer/favoriteSlice";
import indecreaseSlice from "./slices/buyer/indecreaseSlice";
import itemsQuantitySlice from "./slices/buyer/itemsQuantitySlice";
import getActivitySlice from "./slices/supplier/getActivitySlice";
import importHistorySlice from "./slices/supplier/importHistorySlice";
import orderHistorySlice from "./slices/supplier/orderHistorySlice";
import historySlice from "./slices/buyer/historySlice";
import draftHistorySlice from "./slices/buyer/draftHistorySlice";
import orderDetailSlice from "./slices/buyer/orderDetailSlice";
import RatingSlice from "./slices/buyer/RatingSlice";
import detailShopSlice from "./slices/buyer/detailShopSlice";
import detailProductSlice from "./slices/buyer/detailProductSlice";
import profileSlice from "./slices/buyer/profileSlice";
import invoiceRetailerSlice from "./slices/buyer/invoiceRetailerSlice";
import invoiceDistributorSlice from "./slices/supplier/invoiceDistributorSlice";
import searchSlice from "./slices/buyer/searchSlice";
import retailerInfoSlice from "./slices/buyer/retailerProfileSlice";
import authSlice from "./slices/auth/authSlice";
import orderPageSlice from "./slices/supplier/orderPageSlice";
import notificationSlice from "./slices/supplier/notification/notificationSlice";
import retailerReportSlice from "./slices/buyer/retailerReportSlice";
import notificationRetailerSlice from "./slices/buyer/notification/notificationRetailerSlice";
import homeReportSlice from "./slices/supplier/homeReportSlice";
import inDecreaseProductSlice from "./slices/buyer/inDecreaseProductSlice";
export const store = configureStore({
  reducer: {
    newOrder: SliceNeworder,
    complete: CompleteSlice,
    preparing: PreparingSlice,
    dispatch: DispatchSlice,
    DataUpdateProduct: getDataUpdateSlice,
    account: AccountSlice,
    shop: storeSlice,
    favorite: favoriteSlice,
    counter: indecreaseSlice,
    categoryDistributor: categorySlice,
    getAllProductRetailer: productRetailerSlice,
    product: productSlice,
    productImport: importedPrice,
    addProduct: addProductSlice,
    order: orderSlice,
    profile: accountRetailerSlice,
    getDataAllShop: allShopSlice,
    itemsCounter: itemsQuantitySlice,
    getActivityInfo: getActivitySlice,
    importHistory: importHistorySlice,
    orderHistory: orderHistorySlice,
    history: historySlice,
    draft: draftHistorySlice,
    orderDetail: orderDetailSlice,
    rating: RatingSlice,
    detail: detailShopSlice,
    detailProduct: detailProductSlice,
    retailerProfileLegacy: profileSlice,
    invoice: invoiceRetailerSlice,
    invoiceDis: invoiceDistributorSlice,
    search: searchSlice,
    retailerProfile: retailerInfoSlice,
    dataLogin: authSlice,
    distributorOrder: orderPageSlice,
    allDataNotification: notificationSlice,
    retailerReport: retailerReportSlice,
    DataNotificationRetailer: notificationRetailerSlice,
    homeReport: homeReportSlice,
    inDecrementProduct: inDecreaseProductSlice,
  },
});
