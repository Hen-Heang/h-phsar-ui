import axios from "axios";
import { api } from "../../../utils/api";
import { setLoadingFavorite } from "../../slices/buyer/favoriteSlice";

export const get_only_bookmark = async (dispatch) => {
  dispatch(setLoadingFavorite(true));
  try {
    // dispatch(setLoadingFavorite(true))
    const response = await api.get(
      "buyers/stores/bookmark?pageNumber=1&pageSize=1000",
    );
    return response;
  } catch (e) {
    // dispatch(setLoadingFavorite(false))
    return e;
  }
};
export const get_detail_shop = async (id) => {
  try {
    const response = await api.get(`/buyers/stores/${id}`);
    return response;
  } catch (e) {
    return e;
  }
};

export const get_detail_product = async (id) => {
  try {
    const response = await api.get(`/buyers/stores/${id}/products`);
    return response;
  } catch (e) {
    return e;
  }
};

export const remove_bookmark = async (id) => {
  try {
    const response = await api.delete(`/buyers/stores/${id}/bookmark/remove`);
    return response;
  } catch (e) {
    return e;
  }
};
