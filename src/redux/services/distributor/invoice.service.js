import { api } from "../../../utils/api";
export const get_invoice_by_id = async(id)=>{
    try{
        const response = await api.get(`/distributor/orders/invoice/${id}`);
        return response;
    } catch (e) {
        return e;
    }
}