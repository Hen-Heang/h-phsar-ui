"use client";

import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as chartJS,
  BarElement,
  LinearScale,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import dayjs from "dayjs";
import { api } from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, Filter, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";

chartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function ReportDistributor() {
  useEffect(() => {
    document.title = "StockFlow | Reports";
  }, []);

  const [startDate, setStartDate] = useState(dayjs().subtract(6, 'month').format("YYYY-MM"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM"));
  const [statsTime, setStatsTime] = useState({});
  const [dataSetStats, setDataSetStats] = useState([]);
  const [graphLabel, setGraphLabel] = useState([]);
  const [isClicked, setIsClicked] = useState(false);

  const handleQuickFilter = (months) => {
    setStartDate(dayjs().subtract(months, 'month').format("YYYY-MM"));
    setEndDate(dayjs().format("YYYY-MM"));
    setIsClicked(!isClicked);
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
      const formattedStartDate = dayjs(startDate).startOf('month').format("YYYY-MM-DD");
      const formattedEndDate = dayjs(endDate).endOf('month').format("YYYY-MM-DD");
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/api/v1/distributor/reports?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      try {
        const response = await api.get(url);
        if (response.data?.data) {
          setStatsTime(response.data.data);
          setDataSetStats(response.data.data.orderPerMonth || []);
          setGraphLabel(response.data.data.periodName || []);
        }
      } catch (error) {
      }
    };
    fetchData();
  }, [startDate, endDate, isClicked]);

  const data = {
    labels: graphLabel.length ? graphLabel : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Monthly Orders",
        data: dataSetStats,
        backgroundColor: "rgba(15, 118, 110, 0.8)",
        borderRadius: 8,
        hoverBackgroundColor: "#0f766e",
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
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#64748b" } },
      y: { beginAtZero: true, ticks: { stepSize: 1, color: "#64748b" }, grid: { color: "rgba(0,0,0,0.05)" } },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 md:p-6  min-h-screen"
    >
      <ToastContainer />
      
      <Card className="border-none shadow-sm bg-white ">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100  rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 ">Business Reports</CardTitle>
              <p className="text-slate-500 text-sm">Detailed overview of your sales and performance.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100  p-1 rounded-lg">
              {[
                { label: "3M", val: 3 },
                { label: "6M", val: 6 },
                { label: "1Y", val: 12 }
              ].map(q => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleQuickFilter(q.val)}
                  className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white  transition-all text-slate-600  shadow-sm"
                >
                  {q.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="month"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200  rounded-lg bg-white  text-slate-700  focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-slate-400 text-xs font-bold">TO</span>
              <input
                type="month"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200  rounded-lg bg-white  text-slate-700  focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <Button onClick={handleSubmit} className="gap-2 rounded-lg h-10 px-6">
              <Filter className="w-4 h-4" />
              Apply
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: "Total Expense", value: statsTime.totalExpense, icon: <DollarSign className="w-5 h-5" />, color: "text-rose-600", bg: "bg-rose-50" },
              { label: "Total Profit", value: statsTime.totalProfit, icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Total Orders", value: statsTime.totalOrder, icon: <ShoppingBag className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50" },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-100  bg-white  shadow-sm flex items-center gap-4">
                <div className={`p-4 ${stat.bg}  rounded-2xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 ">
                    {typeof stat.value === 'number' ? (stat.label.includes('Order') ? stat.value : `$${stat.value.toFixed(2)}`) : (stat.value || 0)}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="h-[450px] w-full mt-10 p-6 rounded-2xl bg-slate-50/50  border border-slate-100 ">
            <Bar data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ReportDistributor;


