import { api } from "@/utils/api";

export const get_dis_home_report = async (startDate, endDate) => {
  return api.get("/distributor/order_activities/months", {
    params: { startDate, endDate },
  });
};
