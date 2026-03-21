import React, { useEffect, useState } from "react";
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
} from "chart.js";

import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { toast } from "react-toastify";
import { api } from "../../utils/api";
import { Backdrop, Button, CircularProgress, TextField } from "@mui/material";
import { get_retailer_report } from "../../redux/services/retailer/retailerReportServices";
import { useDispatch, useSelector } from "react-redux";
import { getRetailerReport } from "../../redux/slices/retailer/retailerReportSlice";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportPageRetailer() {
  useEffect(() => {

    document.title = "H-Phsar | Report";
  }, []);
  const dispatch = useDispatch();

  // For filter the date
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [formattedStartDate, setFormattedStartDate] = useState();
  const [formattedEndDate, setFormattedEndDate] = useState();
  const [report, setStatsTime] = useState([]);
  const [date, setDate] = useState(true);
  const [isClicked, setIsClicked] = useState(false);
  const currentDate = new Date().toLocaleDateString();
  const [startDateIsAfterCurrentDate, setStartDateIsAfterCurrentDate] = useState(false);
  const [endDateIsAfterCurrentDate, setEndDateIsAfterCurrentDate] = useState(false);
  const [testReport, setTestReport] = useState({});
  const handleStartDateChange = (newValue) => {

   // console.log("value start date ", newValue);
    if (newValue.isAfter(dayjs(), "day")) {
      toast.error("Selected date should not be higher than today!");
      // console.log("currentDate", typeof currentDate);
      // console.log("Test ", newValue.isAfter(dayjs(), "day"));
      setStartDateIsAfterCurrentDate(newValue.isAfter(dayjs(), "day"));

      //console.log("startDateIsAfterCurrentDate", startDateIsAfterCurrentDate);
      setStartDate();
    } else {

      // console.log("Else start : ", newValue);
      // setStartDate(newValue);

      if (newValue !== null) {
        const formattedStartDate = dayjs(newValue).format("YYYY-MM");
        setFormattedStartDate(formattedStartDate);
        setStartDateIsAfterCurrentDate(false);
        console.log("formattedStartDate type", typeof formattedStartDate);
        console.log("formattedStartDate : ", formattedStartDate);
      }
    }
  };

  const handleEndDateChange = (newValue) => {
    console.log("value end date ", newValue);

    if (newValue.isAfter(dayjs(), "day")) {
      toast.error("Selected date should not be higher than today!");
      console.log("Test ", formattedEndDate > currentDate);
      console.log("End ", newValue.isAfter(dayjs(), "day"));
      setEndDateIsAfterCurrentDate(newValue.isAfter(dayjs(), "day"));
      setEndDate();

    } else {
      console.log("Hi end date");

      setEndDate(newValue);
      if (newValue !== null) {
        const formattedEndDate = dayjs(newValue).format("YYYY-MM");
        setFormattedEndDate(formattedEndDate);
        setEndDateIsAfterCurrentDate(false);
        console.log("formattedEndDate : ", formattedEndDate);
      }
    }
  };

  // For submit date
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleOpen = () => {
    setOpen(true);
  };

  const handleSubmit = () => {
    console.log("isClicked: ", isClicked);
    // if (startDate !== null && endDate !== null) {
    setIsClicked(!isClicked);
    // }
    localStorage.setItem("startDate", formattedStartDate);
    localStorage.setItem("endDate", formattedEndDate);
    setOpen(true);

    if (formattedStartDate === null && formattedEndDate === null) {
      console.log("Hi message");
      setOpen(false);
      toast.error("Please select date", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      //  setIsLoading(false);
      return;
    }

    // Reset the form or perform any other actions
    setStartDate();
    setEndDate();
  };

  const reportURL = () => {
    console.log("Start : ", startDate);
    console.log("End : ", endDate);

    const baseURL = "http://localhost:8888/api/v1/retailer/reports";
    

    //     if (startDate) {
    //       const formattedStartDate = dayjs(startDate).format("YYYY-MM");
    //
    //       setFormattedStartDate(formattedStartDate);
    //     }

    //     if (endDate) {
    //       const formattedEndDate = dayjs(endDate).format("YYYY-MM");
    //
    //       setFormattedEndDate(formattedEndDate);
    //     }
    

    const urlWithQuery = `${baseURL}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
    console.log(urlWithQuery);
    return urlWithQuery;
  };
  // check again
  const reportRetailer = useSelector(
    (state) => state.retailerReport.retailerReport
  );

  useEffect(() => {
    const fetchData = async () => {
      const url = reportURL();

      try {
        console.log(formattedStartDate);
        console.log(formattedEndDate);
        const res = await get_retailer_report(
          formattedStartDate,
          formattedEndDate
        );
        setOpen(false);
        console.log("res : ", res);
        dispatch(getRetailerReport(res.data.data));
        // //
        //         setTestReport(res.data.data);
        //         console.log("test :", testReport);

        // const response = await api
        //   .get(url)
        //   .then((response) => {
        //     // setData(response.data);
        //     setStatsTime(response.data.data);
        //     console.log("res : ", response);
        //     //  toast.success("Dates submitted successfully");
        //     setOpen(false);
        //   })
        //   .then(() => {
        //     console.log("Hi then");
        //     toast.success("Fetch all data successful", {
        //       position: "top-right",
        //       autoClose: 3000,
        //       hideProgressBar: false,
        //       closeOnClick: true,
        //       pauseOnHover: true,
        //       draggable: true,
        //       progress: undefined,
        //       theme: "light",
        //     });
        //     // toast.success(response.data.data.message)
        //   })
        //   .catch((error) => {
        //     console.log("error : ", error);
        //     if (error.response.status === 400) {
        //       toast.error(error.response.data.detail);
        //       setOpen(false);
        //     }
        //     if (error.response.status === 401) {
        //       toast.error(error.response.data.detail);
        //       setOpen(false);
        //       // alert(open)
        //       console.log(error.response.data.detail);
        //     }
        //   });

        // setIsLoading(false); // Set loading state to false
        // console.log(response.data.data);
      } catch (error) {
        console.log("This is error", error);
      }
    };
    
    // setIsLoading(true); // Set loading state to true before fetching data
    fetchData();
  }, [isClicked]);
  // [startDate && endDate]

  // set when opening
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(true);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000); // Delay of 500 milliseconds

    return () => clearTimeout(timer);
  }, []);

  console.log("Here is data from store : ", reportRetailer);

  // const [isGreaterThanCurrentDate, setIsGreaterThanCurrentDate] =
  //   useState(false);

  // useEffect(() => {
  //   console.log("curr : ", currentDate);
  // },[])

  {
    {
      const data1 = {
        labels: ["Accepted", "Rejected"],
        datasets: [
          {
            label: "Number of Order",
            //data: statsTime.totalRejectedAndAccepted,
            data: reportRetailer.totalRejectedAndAccepted
              ? reportRetailer.totalRejectedAndAccepted
              : [0, 0],
            backgroundColor: ["rgb(29, 221, 140)", "rgb(237, 102, 102)"],
            borderColor: ["rgb(29, 221, 140)", "rgb(237, 102, 102)"],
            borderWidth: 1,
          },
        ],
      };
      const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,

        // Adjust the size of the chart container by modifying the following properties
        width: 200,
        height: 200,
        Legend: {
          position: "left",
        },
      };

      const data2 = {
  
        labels: reportRetailer.categoryNameOrdered
          ? reportRetailer.categoryNameOrdered
          : ["A", "B", "C"],
        datasets: [
          {
            label: "Number of category name ",
            //data: statsTime.totalQtyEachCategory,
            data: reportRetailer.totalQtyEachCategory
              ? reportRetailer.totalQtyEachCategory
              : [0, 0, 0],
            backgroundColor: [
              "rgb(247, 101, 163)",
              "rgb(161, 85, 185)",
              "rgb(22, 191, 214)",
              "rgb(29, 221, 141)",
              "rgb(244, 132, 89)",
            ],
            borderColor: [
              "rgb(247, 101, 163)",
              "rgb(161, 85, 185)",
              "rgb(22, 191, 214)",
              "rgb(29, 221, 141)",
              "rgb(244, 132, 89)",
            ],
            borderWidth: 1,
          },
        ],
      };

      const lineOptions = {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            align: "",
            onClick: (e) => e.stopPropagation(), // Prevent legend filtering
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      };
      // console.log(statsTime.monthAndYearLabel)
      const lineChart = {
        labels: reportRetailer.monthAndYearLabel
          ? reportRetailer.monthAndYearLabel
          : [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ],
        borderColor: "rgb(241, 91, 34)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        datasets: [
          {
            label: "Monthly Expense",
            data: reportRetailer.totalExpenseInEachMonth
              ? reportRetailer.totalExpenseInEachMonth
              : [],
            borderColor: "rgb(241, 91, 34)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      };

      return (
        <div className="">
          <div>
            {/* <Button onClick={handleOpen}>Show backdrop</Button> */}
            <Backdrop
              sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={open}
              // onClick={handleClose}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </div>
          {/* background */}
          <div className="bg-retailerBackground w-full mx-auto   flex justify-center ">
            {/* white bg */}
            <div className="bg-white w-[95%] lg:w-[80%] lg:h-[1540px] h-[1880px] flex flex-wrap flex-col  shadow-md ">
              <div className="ml-5 flex flex-col lg:flex-row lg:justify-between justify-start w-full pr-5">
                <h1 className="text-retailerPrimary lg:text-3xl text-xl lg:mt-10 mt-5 ">
                  Analytical Report
                  <p className="lg:text-[16px] text-[14px] lg:leading-10 leading-5 text-[#777777] pr-5 lg:pr-0">
                    Check your expense to report help guide you become a better
                    retailer
                  </p>
                </h1>
                <div className="flex lg:flex-row flex-col mr-5 gap-0 lg:gap-3 lg:items-center mt-5 lg:mt-16">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={'"Start Date"'}
                      views={["year", "month"]}
                      format="YYYY-MM"
                      value={startDate}
                      onChange={handleStartDateChange}
                      // className={format === "YYYY-MM" ? "borderlessDatePicker" : ""}
                    />
                  </LocalizationProvider>
                  <p className="text-center">To</p>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={'"End Date"'}
                      views={["year", "month"]}
                      value={endDate}
                      format="YYYY-MM"
                      onChange={handleEndDateChange}
                    />
                  </LocalizationProvider>

                  {startDateIsAfterCurrentDate === true ||
                  endDateIsAfterCurrentDate === true ? (
                    <button className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md ">
                      Check
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 bg-retailerPrimary text-white font-semibold rounded-md hover:bg-orange-400 hover:text-white"
                      onClick={handleSubmit}
                    >
                      Check
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-16 w-full">
                {/* box for stats  */}
                <div className="bg-white flex flex-row flex-wrap justify-evenly ">
                  {/* pie and box*/}
                  <div className="flex lg:flex-row lg:justify-center flex-col  ">
                    {/* pie chart*/}
                    <div className="flex lg:flex-row flex-col">
                      {/* pie1  */}
                      <div className="mx-5 shadow-md lg:w-[350px] w-[316px] rounded-xl">
                        {/* text */}
                        <div className="ml-5 mt-5">
                          <p className=" text-2xl text-[#828282] ">
                            Monthly order
                          </p>
                          <p className="text-3xl">
                            {/* {statsTime.totalOrder} */}
                            {reportRetailer.totalOrder
                              ? `${reportRetailer.totalOrder}`
                              : "0"}
                          </p>
                          <p className="text-[#828282]">Orders</p>
                        </div>
                        <hr />
                        <div className="my-10 lg:ml-0 ml-4 lg:w-[400px] w-[300px] h-[150px] Lg:h-[200px] ">
                          <Pie data={data1} options={pieOptions} />
                        </div>
                      </div>

                      {/* pie2 */}
                      <div className="mx-5 shadow-md lg:w-[350px] w-[316px] rounded-xl">
                        {/* text */}
                        <div className="ml-5 mt-5">
                          <p className=" text-[#828282] text-xl">
                            Total Products Purchased
                          </p>

                          <p className="text-3xl">
                            {/* {statsTime.totalQuantityOrder} */}
                            {reportRetailer.totalQuantityOrder
                              ? `${reportRetailer.totalQuantityOrder}`
                              : "0"}
                          </p>
                          <p className="text-[#828282]">Items</p>
                        </div>
                        <hr />
                        <div className="my-10 lg:ml-0 ml-4 lg:w-[400px] w-[300px] h-[150px] Lg:h-[200px]">
                          <Pie data={data2} options={pieOptions} />
                        </div>
                      </div>
                    </div>
                    {/* box */}
                    <div className="lg:w-[360px] w-[328px] lg:h-[420px] h-[300px] lg:mx-0 mx-5 bg-white shadow-md lg:mt-0 mt-2 flex flex-wrap justify-evenly items-center  rounded-xl ">
                      <div className="">
                        {/* box1 */}
                        <div className="w-[150px] bg-white lg:h-[150px] h-[130px] flex flex-col justify-between  text-center items-center shadow-md lg:m-2 a">
                          <p className="mt-5 text-[#828282]">Amount Purchased Shop</p>
                          <p className="my-auto text-3xl font-semibold ">
                            {/* {statsTime.totalPurchasedShop} */}
                            {reportRetailer.totalPurchasedShop
                              ? `${reportRetailer.totalPurchasedShop}`
                              : "0"}
                          </p>
                        </div>
                        {/* box2 */}
                        <div className="w-[150px] bg-white lg:h-[150px] h-[130px] flex flex-col justify-between  text-center items-center shadow-md lg:m-2 lg:mt-0 mt-2 a">
                          <p className="mt-5  text-[#828282]">Rating Shop </p>
                          <p className="my-auto text-3xl font-semibold ">
                            {/* {statsTime.totalRatingShop} */}
                            {reportRetailer.totalRatingShop
                              ? `${reportRetailer.totalRatingShop}`
                              : "0"}
                          </p>
                        </div>
                      </div>

                      <div>
                        {/* box3 */}
                        <div className="w-[150px]bg-white lg:h-[150px] h-[130px] flex flex-col justify-between  text-center items-center shadow-md lg:m-2 a">
                          <p className="mt-5   text-[#828282]">Total Expense</p>
                          <p className="my-auto text-3xl font-semibold text-[#50D66D] ">
                            {/* ${statsTime.totalExpenseOrdered} */}
                            {reportRetailer.totalExpenseOrdered
                              ? `$${reportRetailer.totalExpenseOrdered}`
                              : "$0.00"}
                          </p>
                        </div>
                        {/* box4 */}
                        <div className="w-[150px] bg-white lg:h-[150px] h-[130px] flex flex-col justify-between  text-center items-center shadow-md lg:m-2 lg:mt-0 mt-2 a">
                          <p className="mt-5  text-[#828282]">
                            Average Monthly expense
                          </p>
                          <p className="my-auto text-3xl font-semibold text-[#50D66D] ">
                            {/* ${statsTime.averageMonthlyExpense} */}
                            {reportRetailer.averageMonthlyExpense
                              ? `$${reportRetailer.averageMonthlyExpense}`
                              : "$0.00"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* graph */}
                  <div className="lg:w-[1420px] w-[328px] lg:mx-auto mt-12 lg:mr-0 mr-5 shadow-lg rounded-xl">
                    {/* Text */}
                    <div className="ml-4 ">
                      <p className="text-2xl mt-7 text-[#828282]">
                       Total Years Expense
                      </p>

                      <p className="text-2xl  mt-4 text-[#50D66D]">
                        {/* ${statsTime.totalYearlyExpense} */}
                        {reportRetailer.totalYearlyExpense
                          ? `$${reportRetailer.totalYearlyExpense}`
                          : "$0.00"}
                      </p>
                    </div>
                    <hr className="mt-10" />

                    <div className=" lg:ml-16 h-[230px] lg:h-[680px] p-5 w-full">
                      <Line data={lineChart} options={lineOptions} />
                    </div>
                  </div>
                </div>
              </div>
              {/* graph box end here */}
            </div>
          </div>
        </div>
      );
    }
  }
}
