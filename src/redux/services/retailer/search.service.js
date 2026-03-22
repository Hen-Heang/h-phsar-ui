import { api } from "../../../utils/api";
import { setLoading } from "../../slices/retailer/searchSlice";


export const get_search= async(name,dispatch) => {
    try{
        dispatch(setLoading(true));
        const response = await api.get(`retailer/stores/hybrid/search?name=${name}&sort=asc&by=name`)
        return response;
    }
    catch (e){
        return e.response;
    }
}

// export const get_search_category =async(category)=>{
//     try{
//         const response = await api.get(`retailer/stores/category/search?name=${category}&sort=ASC&by=name`)
//         return response;
//     }
//     catch(e){
//       console.log("Error1",e.response)
//       return e;
//     }
// }


// export const get_all_highest_rate = async (sort,pageNumber,pageSize) =>{
//     try{
//       const response= await api.get(/retailer/stores/sort/rated?sort=desc&pageNumber=1&pageSize=100)
//       // console.log("hahaha : " ,response.data.data);
//       return response;
//     }catch(e){
//       console.log("error : ", e);
//     }
//   }