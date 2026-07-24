import { api } from "@/utils/api";

export const get_dis_home_report = async (startDate, endDate) => {
  return api.get("/suppliers/order_activities/months", {
    params: { startDate, endDate },
  });
};
