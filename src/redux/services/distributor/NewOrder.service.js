import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../../utils/api";
import { setLoadingOrder } from "../../slices/retailer/orderSlice";
import { setLoading } from "../../slices/distributor/productSlice";
import { setLoadingTheOrder } from "../../slices/distributor/orderPageSlice";
export const get_newOrder = async (dispatch) => {
  try {
    dispatch(setLoadingTheOrder(true));
    const response = await api.get(
      `/distributor/orders/pending?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e;
  }
};
export const get_newOrder_withoutLoading = async () => {
  try {
    const response = await api.get(
      `/distributor/orders/pending?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e;
  }
};
export const get_accept_newOrder = async (id) => {
  try {
    const response = await api.put(
      `/distributor/orders/pending/accept/${id}`,
      null,
      { skipAuthRedirect: true },
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
export const decline_order = async (id) => {
  try {
    const response = await api.put(
      `/distributor/orders/pending/decline/${id}`,
      null,
      { skipAuthRedirect: true },
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
