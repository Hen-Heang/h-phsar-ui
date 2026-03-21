"use client";

import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
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
import { Calendar, Filter, Clock, TrendingUp } from "lucide-react";

// Static imports for images
import add_shopping_cart_home from "../../assets/images/distributor/add_shopping_cart_home.png";
import packing_home from "../../assets/images/distributor/packing_home.png";
import delivery_home from "../../assets/images/distributor/delivery_home.png";
import Hourglass from "../../assets/images/distributor/Hourglass.png";
import task_completed_home from "../../assets/images/distributor/task_completed_home.png";

chartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const HomeDistributor = () => {
  useEffect(() => {
    document.title = "H-Phsar | Home";
  }, []);

  const getActivityList = useSelector((state) => state.getActivityInfo.data);
  const dispatch = useDispatch();

  useEffect(() => {
    get_all_activity().then((r) => dispatch(getActivityInfo(r.data.data)));
  }, [dispatch]);

  const [startDate, setStartDate] = useState(dayjs().subtract(6, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [formattedStartDate, setFormattedStartDate] = useState(dayjs().subtract(6, 'month').format("YYYY-MM"));
  const [formattedEndDate, setFormattedEndDate] = useState(dayjs().format("YYYY-MM"));
  const [isClicked, setIsClicked] = useState(false);

  const handleQuickFilter = (months) => {
    const start = dayjs().subtract(months, 'month');
    const end = dayjs();
    setStartDate(start);
    setEndDate(end);
    setFormattedStartDate(start.format("YYYY-MM"));
    setFormattedEndDate(end.format("YYYY-MM"));
    setIsClicked(!isClicked);
  };

  const handleStartDateChange = (newValue) => {
    if (newValue && newValue.isAfter(endDate)) {
      toast.warn("Start date should be before end date");
    }
    setStartDate(newValue);
    if (newValue) setFormattedStartDate(newValue.format("YYYY-MM"));
  };

  const handleEndDateChange = (newValue) => {
    if (newValue && newValue.isBefore(startDate)) {
      toast.warn("End date should be after start date");
    }
    setEndDate(newValue);
    if (newValue) setFormattedEndDate(newValue.format("YYYY-MM"));
  };

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      toast.error("Please select a valid date range");
      return;
    }
    setIsClicked(!isClicked);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await get_dis_home_report(formattedStartDate, formattedEndDate);
        dispatch(getDistributorReport(res.data.data));
      } catch (error) {
        console.error("Error fetching report:", error);
      }
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
      }
  );

  const data = {
    labels: distributorReport.month?.length ? distributorReport.month : [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
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
      x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 11 } } },
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
      className="space-y-6 p-4 md:p-6 dark:bg-slate-950 min-h-screen"
    >
      <ToastContainer />
      
      {/* Activity Section */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Order Activity</CardTitle>
          </div>
          <p className="text-slate-500 text-sm">Real-time status of your current orders.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "New Order", value: getActivityList.newOrder, img: add_shopping_cart_home, color: "bg-orange-50 text-orange-600" },
              { label: "Preparing", value: getActivityList.preparing, img: packing_home, color: "bg-blue-50 text-blue-600" },
              { label: "Dispatch", value: getActivityList.dispatch, img: delivery_home, color: "bg-purple-50 text-purple-600" },
              { label: "Confirming", value: getActivityList.confirming, img: Hourglass, color: "bg-amber-50 text-amber-600" },
              { label: "Completed", value: getActivityList.completed, img: task_completed_home, color: "bg-emerald-50 text-emerald-600" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.02]">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-3">
                  <img src={item.img.src || item.img} alt={item.label} className="w-8 h-8 object-contain" />
                </div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</p>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{item.value || 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Performance Insights</CardTitle>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2">
                {[
                  { label: "3M", val: 3 },
                  { label: "6M", val: 6 },
                  { label: "1Y", val: 12 }
                ].map(q => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => handleQuickFilter(q.val)}
                    className="px-3 py-1 text-xs font-bold rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-400"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
              
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="flex items-center gap-2 scale-90 origin-right">
                  <DatePicker
                    views={["year", "month"]}
                    format="MMM YYYY"
                    value={startDate}
                    onChange={handleStartDateChange}
                    slotProps={{ textField: { size: "small", sx: { width: 140 } } }}
                  />
                  <span className="text-slate-400 text-xs font-bold">TO</span>
                  <DatePicker
                    views={["year", "month"]}
                    format="MMM YYYY"
                    value={endDate}
                    onChange={handleEndDateChange}
                    slotProps={{ textField: { size: "small", sx: { width: 140 } } }}
                  />
                </div>
              </LocalizationProvider>
              
              <Button 
                onClick={handleSubmit}
                className="gap-2 px-5 py-2 h-9 rounded-lg"
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
              { label: "Total Orders", value: distributorReport.totalOrder, trend: "+12%" },
              { label: "Inventory Import", value: distributorReport.totalProductImport, trend: "-2%" },
              { label: "Sold Products", value: distributorReport.totalProductSold, trend: "+5%" },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 relative overflow-hidden group">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stat.value || 0}</h3>
                  <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.trend}
                  </span>
                </div>
                <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="w-20 h-20" />
                </div>
              </div>
            ))}
          </div>

          <div className="h-[400px] w-full mt-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <Line data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HomeDistributor;
