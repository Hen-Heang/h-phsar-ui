"use client";

import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Datepicker from "react-tailwindcss-datepicker";
import { useDispatch, useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as chartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { get_all_activity } from "../../redux/services/distributor/homepage.service";
import { getActivityInfo } from "../../redux/slices/distributor/getActivitySlice";
import dayjs from "dayjs";
import { get_dis_home_report } from "../../redux/services/distributor/homeReport.service";
import { getDistributorReport } from "../../redux/slices/distributor/homeReportSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Calendar,
  Filter,
  Clock,
  TrendingUp,
  ShoppingBag,
  Package,
  Truck,
  Hourglass,
  CheckCircle2,
} from "lucide-react";

chartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
);

const HomeDistributor = () => {
  useEffect(() => {
    document.title = "StockFlow | Home";
  }, []);

  const getActivityList = useSelector((state) => state.getActivityInfo.data);
  const dispatch = useDispatch();

  useEffect(() => {
    get_all_activity().then((r) => {
      if (r?.data?.data) dispatch(getActivityInfo(r.data.data));
    });
  }, [dispatch]);

  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(6, "month").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });
  const [formattedStartDate, setFormattedStartDate] = useState(
    dayjs().subtract(6, "month").format("YYYY-MM"),
  );
  const [formattedEndDate, setFormattedEndDate] = useState(
    dayjs().format("YYYY-MM"),
  );
  const [isClicked, setIsClicked] = useState(false);

  const handleQuickFilter = (months) => {
    const start = dayjs().subtract(months, "month");
    const end = dayjs();
    setDateRange({
      startDate: start.format("YYYY-MM-DD"),
      endDate: end.format("YYYY-MM-DD"),
    });
    setFormattedStartDate(start.format("YYYY-MM"));
    setFormattedEndDate(end.format("YYYY-MM"));
    setIsClicked(!isClicked);
  };

  const handleDateChange = (newValue) => {
    setDateRange(newValue);
    if (newValue.startDate)
      setFormattedStartDate(dayjs(newValue.startDate).format("YYYY-MM"));
    if (newValue.endDate)
      setFormattedEndDate(dayjs(newValue.endDate).format("YYYY-MM"));
  };

  const handleSubmit = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error("Please select a valid date range");
      return;
    }
    setIsClicked(!isClicked);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await get_dis_home_report(
          formattedStartDate,
          formattedEndDate,
        );
        dispatch(getDistributorReport(res.data.data));
      } catch (error) {}
    };
    fetchData();
  }, [dispatch, formattedEndDate, formattedStartDate, isClicked]);

  const distributorReport = useSelector(
    (state) =>
      state.homeReport.distributorReport || {
        month: [],
        totalOrderEachMonth: [],
        totalOrder: 0,
        totalProductImport: 0,
        totalProductSold: 0,
      },
  );

  const data = {
    labels: distributorReport.month?.length
      ? distributorReport.month
      : [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
    datasets: [
      {
        label: "Orders",
        data: distributorReport.totalOrderEachMonth || [],
        fill: true,
        borderColor: "#0f766e",
        backgroundColor: "rgba(15, 118, 110, 0.1)",
        tension: 0.4,
        pointBackgroundColor: "#0f766e",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: "#64748b", font: { size: 11 } },
        grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 md:p-6  min-h-screen"
    >
      <ToastContainer />

      {/* Activity Section */}
      <Card className="border-none shadow-sm bg-white ">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-xl font-bold text-slate-900 ">
              Order Activity
            </CardTitle>
          </div>
          <p className="text-slate-500 text-sm">
            Real-time status of your current orders.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                label: "New Order",
                value: getActivityList?.newOrder ?? 0,
                Icon: ShoppingBag,
                color: "text-orange-600",
                bgColor: "bg-orange-50",
              },
              {
                label: "Preparing",
                value: getActivityList?.preparing ?? 0,
                Icon: Package,
                color: "text-blue-600",
                bgColor: "bg-blue-50",
              },
              {
                label: "Dispatch",
                value: getActivityList?.dispatch ?? 0,
                Icon: Truck,
                color: "text-purple-600",
                bgColor: "bg-purple-50",
              },
              {
                label: "Confirming",
                value: getActivityList?.confirming ?? 0,
                Icon: Hourglass,
                color: "text-amber-600",
                bgColor: "bg-amber-50",
              },
              {
                label: "Completed",
                value: getActivityList?.completed ?? 0,
                Icon: CheckCircle2,
                color: "text-emerald-600",
                bgColor: "bg-emerald-50",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center p-5 rounded-2xl bg-slate-50/50  border border-slate-100  transition-all hover:scale-[1.02]"
              >
                <div
                  className={`p-3 ${item.bgColor} rounded-2xl shadow-sm mb-3`}
                >
                  <item.Icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                  {item.label}
                </p>
                <span className="text-3xl font-black text-slate-900 ">
                  {item.value || 0}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <Card className="border-none shadow-sm bg-white ">
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-xl font-bold text-slate-900 ">
                Performance Insights
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-2 relative z-20">
              <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                {[
                  { label: "3M", val: 3 },
                  { label: "6M", val: 6 },
                  { label: "1Y", val: 12 },
                ].map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => handleQuickFilter(q.val)}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg hover:bg-white transition-all text-slate-600 focus:bg-white focus:shadow-sm"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <div className="w-72">
                <Datepicker
                  primaryColor="teal"
                  value={dateRange}
                  onChange={handleDateChange}
                  showShortcuts={true}
                  inputClassName="w-full h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  containerClassName="relative"
                  popoverDirection="down"
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="gap-2 px-5 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold"
              >
                <Filter className="w-4 h-4" />
                Apply
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Total Orders",
                value: distributorReport.totalOrder,
                trend: "+12%",
              },
              {
                label: "Inventory Import",
                value: distributorReport.totalProductImport,
                trend: "-2%",
              },
              {
                label: "Sold Products",
                value: distributorReport.totalProductSold,
                trend: "+5%",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-100  bg-slate-50/30  relative overflow-hidden group"
              >
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900  leading-none">
                    {stat.value || 0}
                  </h3>
                  <span
                    className={`text-[10px] font-bold ${stat.trend.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {stat.trend}
                  </span>
                </div>
                <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="w-20 h-20" />
                </div>
              </div>
            ))}
          </div>

          <div className="h-[400px] w-full mt-4 p-4 rounded-2xl bg-slate-50/50  border border-slate-100 z-0 relative">
            <Line data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HomeDistributor;
