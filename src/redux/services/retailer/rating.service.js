import { api } from "../../../utils/api"
export const rating_star=async(storeId,ratedStar)=>{
    try {
      const response = await api.post(`/retailer/stores/${storeId}/rating`, { "ratedStar": ratedStar } );
      return response;
    } catch (error) {
      return error.response;
      // return error.response;
    }
}
