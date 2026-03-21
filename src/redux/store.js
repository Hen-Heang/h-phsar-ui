import { configureStore } from "@reduxjs/toolkit";
import getDataUpdateSlice from "./slices/distributor/getDataUpdateSlice";
import productSlice from "./slices/distributor/productSlice";
import SliceNeworder from "./slices/distributor/SliceNeworder";
import CompleteSlice from "./slices/distributor/CompleteSlice";
import PreparingSlice from "./slices/distributor/PreparingSlice";
import DispatchSlice from "./slices/distributor/DispatchSlice";
import categorySlice from "./slices/distributor/categorySlice";
import productRetailerSlice from "./slices/retailer/productRetailerSlice";
import AccountSlice from "./slices/distributor/AccountSlice";
import storeSlice from "./slices/distributor/storeSlice";
import importedPrice from "./slices/distributor/importedPrice";
import addProductSlice from "./slices/distributor/addProductSlice";
import orderSlice from "./slices/retailer/orderSlice";
import accountRetailerSlice from "./slices/retailer/accountRetailerSlice";
import allShopSlice from "./slices/retailer/homepageSlice/allShopSlice";
import favoriteSlice from "./slices/retailer/favoriteSlice";
import indecreaseSlice from "./slices/retailer/indecreaseSlice";
import itemsQuantitySlice from "./slices/retailer/itemsQuantitySlice";
import getActivitySlice from "./slices/distributor/getActivitySlice";
import importHistorySlice from "./slices/distributor/importHistorySlice";
import orderHistorySlice from "./slices/distributor/orderHistorySlice";
import historySlice from "./slices/retailer/historySlice";
import draftHistorySlice from "./slices/retailer/draftHistorySlice";
import orderDetailSlice from "./slices/retailer/orderDetailSlice";
import RatingSlice from "./slices/retailer/RatingSlice";
import detailShopSlice from "./slices/retailer/detailShopSlice";
import detailProductSlice from "./slices/retailer/detailProductSlice";
import profileSlice from "./slices/retailer/profileSlice";
import invoiceRetailerSlice from "./slices/retailer/invoiceRetailerSlice";
import invoiceDistributorSlice from "./slices/distributor/invoiceDistributorSlice";
import searchSlice from "./slices/retailer/searchSlice";
import retailerInfoSlice from "./slices/retailer/retailerProfileSlice"
import authSlice from "./slices/auth/authSlice";
import orderPageSlice from "./slices/distributor/orderPageSlice";
import notificationSlice from "./slices/distributor/notification/notificationSlice";
import retailerReportSlice from "./slices/retailer/retailerReportSlice"
import notificationRetailerSlice from "./slices/retailer/notification/notificationRetailerSlice";
import homeReportSlice from "./slices/distributor/homeReportSlice";
import inDecreaseProductSlice from "./slices/retailer/inDecreaseProductSlice";
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
