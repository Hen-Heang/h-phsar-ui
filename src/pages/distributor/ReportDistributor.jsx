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
    document.title = "H-Phsar | Reports";
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
      const url = `http://localhost:8888/api/v1/distributor/reports?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      try {
        const response = await api.get(url);
        if (response.data?.data) {
          setStatsTime(response.data.data);
          setDataSetStats(response.data.data.orderPerMonth || []);
          setGraphLabel(response.data.data.periodName || []);
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
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
      className="space-y-6 p-4 md:p-6 dark:bg-slate-950 min-h-screen"
    >
      <ToastContainer />
      
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Business Reports</CardTitle>
              <p className="text-slate-500 text-sm">Detailed overview of your sales and performance.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {[
                { label: "3M", val: 3 },
                { label: "6M", val: 6 },
                { label: "1Y", val: 12 }
              ].map(q => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleQuickFilter(q.val)}
                  className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-400 shadow-sm"
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
                className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-slate-400 text-xs font-bold">TO</span>
              <input
                type="month"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              { label: "Total Orders", value: statsTime.totalOrder, icon: <ShoppingBag className="w-5 h-5" />, color: "text-teal-600", bg: "bg-teal-50" },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
                <div className={`p-4 ${stat.bg} dark:bg-slate-800 rounded-2xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {typeof stat.value === 'number' ? (stat.label.includes('Order') ? stat.value : `$${stat.value.toFixed(2)}`) : (stat.value || 0)}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="h-[450px] w-full mt-10 p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <Bar data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ReportDistributor;


