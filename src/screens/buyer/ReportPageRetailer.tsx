// @ts-nocheck -- legacy page, pending UI-11 TypeScript alignment pass
import React, { useEffect, useState, useMemo } from "react";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import dayjs from "dayjs";
import Datepicker from "react-tailwindcss-datepicker";
import { toast } from "react-toastify";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Filter,
  RefreshCcw,
  Store,
  Star,
  DollarSign,
  Activity,
} from "lucide-react";

import { get_retailer_report } from "../../redux/services/buyer/retailerReportServices";
import {
  getRetailerReport,
  setLoading,
  setError,
} from "../../redux/slices/buyer/retailerReportSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropagateLoader } from "react-spinners";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function ReportPageRetailer() {
  const dispatch = useDispatch();
  const { retailerReport: reportRetailer, loading } = useSelector(
    (state) => state.retailerReport,
  );

  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(6, "month").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    document.title = "H-Phsar | Analytics Report";
    fetchData();
  }, []);

  const fetchData = async () => {
    dispatch(setLoading(true));
    try {
      const formattedStart = dateRange.startDate
        ? dayjs(dateRange.startDate).format("YYYY-MM")
        : "";
      const formattedEnd = dateRange.endDate
        ? dayjs(dateRange.endDate).format("YYYY-MM")
        : "";

      const res = await get_retailer_report(formattedStart, formattedEnd);
      if (res?.data?.status === 200) {
        dispatch(getRetailerReport(res.data.data));
      } else {
        const errorMsg =
          res?.response?.data?.detail || "Failed to fetch analytical data";
        dispatch(setError(errorMsg));
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      dispatch(setError(error.message));
      toast.error("Failed to sync analytical data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleDateChange = (newValue) => {
    setDateRange(newValue);
  };

  // Chart Configurations
  const pieData1 = useMemo(
    () => ({
      labels: ["Accepted", "Rejected"],
      datasets: [
        {
          data: reportRetailer.totalRejectedAndAccepted || [0, 0],
          backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    }),
    [reportRetailer.totalRejectedAndAccepted],
  );

  const pieData2 = useMemo(
    () => ({
      labels: reportRetailer.categoryNameOrdered || ["No Category"],
      datasets: [
        {
          data: reportRetailer.totalQtyEachCategory || [0],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(236, 72, 153, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(20, 184, 166, 0.8)",
          ],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    }),
    [reportRetailer.categoryNameOrdered, reportRetailer.totalQtyEachCategory],
  );

  const lineChartData = useMemo(
    () => ({
      labels: reportRetailer.monthAndYearLabel || [],
      datasets: [
        {
          label: "Monthly Expense ($)",
          data: reportRetailer.totalExpenseInEachMonth || [],
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#f97316",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
      ],
    }),
    [reportRetailer.monthAndYearLabel, reportRetailer.totalExpenseInEachMonth],
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: { family: "inherit", weight: "600", size: 11 },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        displayColors: true,
        cornerRadius: 8,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="mx-auto w-[90%] max-w-7xl pt-12">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-orange-500">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                Business Intelligence
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Analytical Report
            </h1>
            <p className="mt-2 text-slate-500 max-w-xl">
              Gain insights into your spending patterns and order performance to
              optimize your retail operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[2rem] border border-slate-200 shadow-sm z-10 relative">
            <div className="w-72">
              <Datepicker
                primaryColor="orange"
                value={dateRange}
                onChange={handleDateChange}
                showShortcuts={true}
                inputClassName="w-full h-10 px-4 rounded-xl border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                containerClassName="relative"
                popoverDirection="down"
              />
            </div>
            <div className="h-8 w-px bg-slate-100 hidden sm:block mx-2" />
            <Button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="rounded-xl bg-orange-500 hover:bg-orange-600 font-bold gap-2 h-10 px-6"
            >
              {isRefreshing ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
              Apply Filters
            </Button>
          </div>
        </header>

        {loading && !isRefreshing ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <PropagateLoader color="#f97316" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-4">
              Generating Insights...
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Top Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Total Expense",
                  value: `$${reportRetailer.totalExpenseOrdered || "0.00"}`,
                  icon: DollarSign,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  desc: "Cumulative spending",
                },
                {
                  title: "Monthly Avg",
                  value: `$${reportRetailer.averageMonthlyExpense || "0.00"}`,
                  icon: TrendingUp,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  desc: "Average per month",
                },
                {
                  title: "Shops Visited",
                  value: reportRetailer.totalPurchasedShop || "0",
                  icon: Store,
                  color: "text-orange-600",
                  bg: "bg-orange-50",
                  desc: "Unique distributors",
                },
                {
                  title: "Avg. Shop Rating",
                  value: reportRetailer.totalRatingShop || "0.0",
                  icon: Star,
                  color: "text-yellow-600",
                  bg: "bg-yellow-50",
                  desc: "Distributor quality",
                },
              ].map((stat, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-[2rem]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}
                        >
                          <stat.icon className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Stats
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {stat.title}
                      </h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">
                          {stat.value}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] font-medium text-slate-400">
                        {stat.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Pie Charts Container */}
              <div className="space-y-8 lg:col-span-1">
                <motion.div variants={itemVariants}>
                  <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="border-b border-slate-50 p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg font-black text-slate-900">
                          Order Velocity
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <span className="text-4xl font-black text-slate-900">
                          {reportRetailer.totalOrder || 0}
                        </span>
                        <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                          Total Orders
                        </p>
                      </div>
                      <div className="h-[220px]">
                        <Pie data={pieData1} options={chartOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="border-b border-slate-50 p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <PieChartIcon className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg font-black text-slate-900">
                          Category Mix
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <span className="text-4xl font-black text-slate-900">
                          {reportRetailer.totalQuantityOrder || 0}
                        </span>
                        <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                          Items Procured
                        </p>
                      </div>
                      <div className="h-[220px]">
                        <Pie data={pieData2} options={chartOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Main Line Chart */}
              <div className="lg:col-span-2">
                <motion.div variants={itemVariants} className="h-full">
                  <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden h-full flex flex-col z-0 relative">
                    <CardHeader className="border-b border-slate-50 p-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-black text-slate-900">
                              Expense Trend
                            </CardTitle>
                            <p className="text-xs font-medium text-slate-400 mt-1">
                              Monthly procurement expenditure
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            Yearly Total
                          </span>
                          <span className="text-2xl font-black text-emerald-600">
                            ${reportRetailer.totalYearlyExpense || "0.00"}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 flex-1 flex flex-col justify-center">
                      <div className="h-[450px] w-full">
                        <Line
                          data={lineChartData}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: { display: false },
                            },
                            scales: {
                              y: {
                                grid: { color: "#f1f5f9" },
                                border: { display: false },
                                ticks: {
                                  font: { size: 11, weight: "600" },
                                  color: "#94a3b8",
                                },
                              },
                              x: {
                                grid: { display: false },
                                border: { display: false },
                                ticks: {
                                  font: { size: 11, weight: "600" },
                                  color: "#94a3b8",
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
