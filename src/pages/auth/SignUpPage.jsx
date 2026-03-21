"use client";

import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import OtpInput from "react-otp-input";
import { string, ref } from "yup";
import Swal from "sweetalert2";
import {
  generateCodeService,
  registerService,
  verifyEmailService,
} from "../../redux/services/auth/auth.server";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PulseLoader, RingLoader } from "react-spinners";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email format is valid")
    .required("Email cannot be blank"),
  password: Yup.string()
    .required("Password cannot be blank")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
    ),
  confirmPassword: string()
    .required("Please re-type your password")
    // use oneOf to match one of the values inside the array.
    // use "ref" to get the value of passwrod.
    .oneOf([ref("password")], "Passwords does not match"),
});

const SignUpPage = () => {
  // OTP
  const [otp, setOtp] = useState("");
  // console.log(otp);
  // modal verify email
  const [showModalVerify, setShowModalVerify] = useState(false);
  const [errorVerify, setErrorVerify] = useState(false);
  const [showLine, setShowLine] = useState(true);
  // modal choose roles
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState({
    roleId: "",
  });
  const [errorRole, setErrorRole] = useState(false);
  // console.log(role);

  // store data onchange register
  const [dataOnchange, setDataOnchange] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleSubmit = (data) => {
    setDataOnchange(data);
    setShowModal(true);
  };

  const [loadingOTP, setLoadingOTP] = useState(false);
  const [successOTP, setSuccessOTP] = useState(false);
  const [loadingChooseRole, setLoadingChooseRole] = useState(false);
  // onsubmit data user
  const onSubmitChooseRole = () => {
    setLoadingChooseRole(true);
    // console.log(dataOnchange);
    if (role.roleId === "") {
      setErrorRole(true);
      setShowModal(true);
      setLoadingChooseRole(false);
    } else {
      registerService(dataOnchange, role).then((res) => {
        // console.log("err", res);
        if (res.data.status === 201) {
          setLoadingOTP(true);
          setShowModal(false);
          generateCodeService(dataOnchange)
            .then((res) => {
              // console.log(res.data)
              setLoadingChooseRole(false);
              setSuccessOTP(true);
            })
            .then((res) => {
              setLoadingOTP(false);
              setSuccessOTP(false);
              setShowModalVerify(true);
            });
        } else {
          // console.log(res);
          setShowModal(false);
          toast.error(`${res.data.detail}`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          setLoadingChooseRole(false);
          // Swal.fire({
          //   icon: "error",
          //   // title: "Oops...",
          //   html: `<span className="text-red-600">${res.data.detail}</span>`,
          // });
        }
      });
    }
  };

  // resend code to verify
  const handleResendVerify = () => {
    setLoadingChooseRole(true);
    // console.log(dataOnchange);
    if (role.roleId === "") {
      setErrorRole(true);
      setShowModal(true);
      setLoadingChooseRole(false);
    } else {
      generateCodeService(dataOnchange).then((res) => {
        // console.log("err", res);
        if (res.data.status === 201) {
          setLoadingOTP(true);
          setShowModal(false);
          generateCodeService(dataOnchange)
            .then((res) => {
              // console.log(res.data)
              setLoadingChooseRole(false);
              setSuccessOTP(true);
            })
            .then((res) => {
              setLoadingOTP(false);
              setSuccessOTP(false);
              setShowModalVerify(true);
            });
        } else {
          // console.log(res);
          setShowModal(false);
          toast.error(`${res.data.detail}`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          // Swal.fire({
          //   icon: "error",
          //   // title: "Oops...",
          //   html: `<span className="text-red-600">${res.data.detail}</span>`,
          // });
        }
      });
    }
  };

  // ========================== verify email =================================

  const [loadingVerifyEmail, setLoadingVerifyEmail] = useState(false);
  const onSubmitVerifyEmail = (data) => {
    setLoadingVerifyEmail(true);
    if (otp === "") {
      setShowModalVerify(true);
      setLoadingVerifyEmail(false);
    }
    verifyEmailService(dataOnchange, otp).then((res) => {
      setLoadingVerifyEmail(false);
      console.log("res " + res);
      if (res.data.status === 200) {
        setShowModalVerify(false);
        setShowLine(false);
        Swal.fire({
          position: "center",
          icon: "success",
          iconColor: "#0F766E",
          title: "<h1 style='color:#0F766E'>Congratulations!</h1>",
          text: "You have signed up successfully",
          showConfirmButton: false,
          timer: 2500,
        }).then(() => {
          router.push("/sign-in");
        });
      }
      // navigate("/login");
      else {
        setLoadingVerifyEmail(false);
        console.log("Error " + res);
        Swal.fire({
          icon: "error",
          // title: "Oops...",
          html: `<span className="text-red-600">${res.data.detail}</span>`,
        });
      }
    });
  };

  // show and hide password
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function togglePasswordVisibility() {
    setIsPasswordVisible((prevState) => !prevState);
  }
  // const testButton = () => {
  //   let timerInterval;
  //   setLoadingOTP(true);
  // };

  return (
    <div className="bg-backGroundColor h-screen ">
      {/* <button onClick={testButton}>test</button> */}
      {/* <RingLoader color="#36d7b7" /> */}
      <Dialog open={loadingOTP} onOpenChange={setLoadingOTP}>
        <DialogContent className="max-w-md border-0 p-0 sm:rounded-2xl" showClose={false}>
          <div className="text-center py-10">
            <div className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200">
              {successOTP ? (
                <img src={(require("../../assets/images/success.png")?.default || require("../../assets/images/success.png"))} alt="" />
              ) : (
                <RingLoader color="#0f766e" />
              )}
            </div>
            <h1 className="text-2xl font-medium text-primary">
              {successOTP ? (
                "Generated successfully"
              ) : (
                <>
                  Generating code
                  <span className="-mb-2">
                    <PulseLoader size="4px" color="#0f766e" />
                  </span>
                </>
              )}
            </h1>
            <h3 className=" text-lg font-normal text-gray-500 dark:text-gray-400">
              {successOTP
                ? "You have successfully generated"
                : "Please wait for few seconds"}
            </h3>
          </div>
        </DialogContent>
      </Dialog>
      <ToastContainer />
      <div className="w-4/5 lg:w-3/6 h-screen flex m-auto flex-col justify-evenly ">
        {/* <section className="h-5/6 bg-white flex flex-wrap items-center justify-center">
          
        </section> */}
        <div className="md:h-4/6 lg:h-5/6 grid grid-cols-2 shadow-md ">
          {/* Left component */}
          <div className="col-span-1 sign_up_bg hidden lg:block lg:rounded-tl-lg lg:rounded-bl-lg">
            <div className="h-full bg-primaryColor/80 lg:rounded-tl-lg lg:rounded-bl-lg  flex flex-col justify-evenly items-center">
              <div className="w-4/5 ">
                <h1 className="text-4xl font-bold text-white leading-relaxed">
                  Discover the best Distributor in Cambodia.
                </h1>
                <br />
                <p className="text-md font-bold text-white">
                  Becoming the best distributor with us now!
                </p>
              </div>
            </div>
          </div>
          {/* Right component */}
          <div className="col-span-2  lg:col-span-1 bg-white lg:rounded-tr-lg lg:rounded-br-lg flex items-center">
            <div className="w-4/5 m-auto">
              <Formik
                initialValues={{
                  email: "",
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={SignupSchema}
                onSubmit={(values) => {
                  // same shape as initial values
                  handleSubmit(values);
                  // console.log(values);
                }}
              >
                {({ errors, touched }) => (
                  <Form>
                    {/* <!--Logo--> */}
                    <div className="text-center mb-10">
                      <h4 className="pb-1 text-4xl font-semibold text-gray-500">
                        Welcome to <br />
                        <span className="text-primaryColor">
                          H-Phsar
                        </span>
                      </h4>
                      <p className="text-gray-500">
                        Fill in your information to start journey with us{" "}
                      </p>
                    </div>
                    {/* Field field */}
                    <div>
                      <div className="flex flex-wrap flex-col gap-5">
                        {/* email */}
                        <div className="relative">
                          <img
                            className="absolute top-2.5 right-2 w-6"
                            src={(require("../../assets/images/emailIcon.png")?.default || require("../../assets/images/emailIcon.png"))}
                            alt=""
                          />
                          <Field
                            name="email"
                            placeholder="Email"
                            className={`border border-primaryColor text-gray-900 text-sm rounded-lg ${
                              errors.email && touched.email
                                ? "focus:ring-red-500 border-red-500 focus:outline-none focus:border-red-500"
                                : null
                            } focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none`}
                          />
                          {errors.email && touched.email ? (
                            <div className="text-red-400 text-xs mt-1 ml-2">
                              {errors.email}
                            </div>
                          ) : null}
                        </div>

                        {/* Password */}
                        <div className="relative">
                          <div
                            className="absolute top-2.5 right-2 w-6"
                            onClick={() => togglePasswordVisibility("password")}
                          >
                            {isPasswordVisible ? (
                              <img
                                src={(require("../../assets/images/show.png")?.default || require("../../assets/images/show.png"))}
                                className="w-[26px]"
                                alt=""
                              />
                            ) : (
                              <img
                                src={(require("../../assets/images/eye_hidden_password.png")?.default || require("../../assets/images/eye_hidden_password.png"))}
                                alt=""
                                className="w-[26px]"
                              />
                            )}
                          </div>

                          <Field
                            type={isPasswordVisible ? "text" : "password"}
                            name="password"
                            className={`border border-primaryColor text-gray-900 text-sm rounded-lg ${
                              errors.password && touched.password
                                ? "focus:ring-red-500 border-red-500 focus:outline-none focus:border-red-100"
                                : null
                            } focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primaryColor dark:focus:border-primaryColor focus:outline-none`}
                            placeholder="Password"
                          />
                          {errors.password && touched.password ? (
                            <div className="text-red-400 text-xs mt-1 ml-2">
                              {errors.password}
                            </div>
                          ) : null}
                        </div>

                        {/* Conform password */}
                        <div className="relative">
                          <div
                            className="absolute top-2.5 right-2 w-6"
                            onClick={() =>
                              togglePasswordVisibility("confirmPassword")
                            }
                          >
                            {isPasswordVisible ? (
                              <img
                                src={(require("../../assets/images/show.png")?.default || require("../../assets/images/show.png"))}
                                className="w-[26px]"
                                alt=""
                              />
                            ) : (
                              <img
                                src={(require("../../assets/images/eye_hidden_password.png")?.default || require("../../assets/images/eye_hidden_password.png"))}
                                alt=""
                                className="w-[26px]"
                              />
                            )}
                          </div>
                          <Field
                            type={isPasswordVisible ? "text" : "password"}
                            name="confirmPassword"
                            aria-describedby="helper-text-explanation"
                            className={`border border-primaryColor text-gray-900 text-sm rounded-lg ${
                              !!errors.confirmPassword &&
                               ( "focus:ring-red-500 border-red-500 focus:outline-none focus:border-red-100")
                               
                            } focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none`}
                            placeholder="Confirm password"
                          />
                          {!!errors.confirmPassword && (
                            <div className="text-red-400 text-xs mt-1 ml-2">
                              {errors.confirmPassword}
                            </div>
                          )}
                          {/* {errors.confirmPassword && touched.confirmPassword ? (
                            <div className="text-red-400 text-xs mt-1 ml-2">
                              {errors.confirmPassword}
                            </div>
                          ) : null} */}
                        </div>
                        <button
                          type="submit"
                          className="inline-block rounded bg-primaryColor px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                        >
                          Sign up
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
              <div className="flex justify-evenly ">
                <p>
                  Already have an account?{" "}
                  <Link href="/sign-in">
                    <span className="text-primaryColor">Sign in</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal choose role */}
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-7xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*body*/}
                <div className="relative p-6 flex items-center h-full">
                  <button onClick={() => setShowModal(false)}>
                    <img
                      src={(require("../../assets/images/close.png")?.default || require("../../assets/images/close.png"))}
                      alt=""
                      className="w-10 absolute top-5 right-5"
                    />
                  </button>
                  <div>
                    <div className="w-4/5 lg:w-3/5 m-auto">
                      <div className=" grid grid-cols-12 h-full  md:gap-5  lg:gap-0">
                        {/* component left */}
                        {/* <div className="hidden md:block md:col-span-1  lg:h-4/5 justify-center m-auto">
                          <div>
                            <img
                              className="lg:h-full mt-12"
                              src={(require("../../assets/images/Line_chooseRole.png")?.default || require("../../assets/images/Line_chooseRole.png"))}
                              alt=""
                            />
                          </div>
                        </div> */}
                        {/* component right */}
                        <div className="md:col-span-12 lg:h-full lg:w-11/12 justify-center m-auto">
                          <form>
                            <div className="">
                              <div>
                                <h1 className="text-3xl font-bold text-primaryColor text-center ">
                                  Who would you like to become?
                                </h1>
                                <p className="text-gray-500 mt-5 text-center">
                                  Are you ready to experience something you have
                                  always wanted? Select your role here and
                                  started your journey now!
                                </p>
                              </div>
                              <div>
                                <div className="">
                                  {/* Distributor */}
                                  <label
                                    htmlFor="distributor"
                                    className="relative flex p-8 mt-10 w-full hover:shadow-primaryColor shadow-sm bg-white border border-gray-200 active:border-primaryColor focus:border-primaryColor rounded-md text-sm  dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400"
                                  >
                                    <img
                                      src={(require("../../assets/images/victory_choose_role.png")?.default || require("../../assets/images/victory_choose_role.png"))}
                                      className="absolute top-4 lg:left-10"
                                      alt=""
                                    />
                                    <span className=" text-gray-500 dark:text-gray-400 absolute md:top-5 left-24 lg:left-32">
                                      <h1 className="font-bold text-xl">
                                        Distributor
                                      </h1>
                                      <p className="hidden text-xs md:block">
                                        I'd like to provide the best products to
                                        my retailers.
                                      </p>
                                    </span>
                                    <input
                                      type="radio"
                                      name="roleId"
                                      value="1"
                                      onChange={(e) => setRole(e.target.value)}
                                      id="distributor"
                                      className="shrink-0 ml-auto mt-0.5 border-gray-200 rounded-full text-primaryColor pointer-events-none focus:ring-primaryColor dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                                    />
                                  </label>
                                  {/* Retailer */}
                                  <label
                                    htmlFor="retailer"
                                    className="relative flex p-8 mt-7 w-full hover:shadow-primaryColor visited:shadow-primaryColor shadow-sm bg-white border border-gray-200 rounded-md text-sm focus:ring-primaryColor focus:border-primaryColor focus:outline-primaryColor dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400"
                                  >
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      <img
                                        src={(require("../../assets/images/trolley_choose_role.png")?.default || require("../../assets/images/trolley_choose_role.png"))}
                                        className="absolute top-4 lg:left-10"
                                        alt=""
                                      />
                                      <span className=" text-gray-500 dark:text-gray-400 absolute md:top-5 left-24 lg:left-32">
                                        <h1 className="font-bold text-xl">
                                          Retailer
                                        </h1>

                                        <p className="hidden text-xs md:block">
                                          I'd to find a good distributor for my
                                          shop.
                                        </p>
                                      </span>
                                    </span>
                                    <input
                                      type="radio"
                                      onChange={(e) => setRole(e.target.value)}
                                      name="roleId"
                                      value="2"
                                      id="retailer"
                                      className="shrink-0 ml-auto mt-0.5 border-gray-200 rounded-full text-primaryColor pointer-events-none focus:ring-primaryColor dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                                    />
                                  </label>
                                </div>
                              </div>
                              {errorRole ? (
                                <div className="text-red-400 text-xs mt-1 ml-2">
                                  Please choose the role you want to
                                </div>
                              ) : null}
                              {/* {values.role !== ""
                                    ? () => onSubmitChooseRole()
                                    : setShowModal(true)} */}
                            </div>
                            {/* Button */}
                            <div>
                              <button
                                type="button"
                                onClick={onSubmitChooseRole}
                                className="mt-7 lg:mt-12 flex items-center justify-center gap-3 rounded-xl bg-primaryColor text-xl w-full py-4 font-medium  leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-cyan-400 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                                data-te-ripple-init
                                data-te-ripple-color="light"
                              >
                                {loadingChooseRole ? (
                                  <>
                                    <span
                                      className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-white rounded-full"
                                      role="status"
                                      aria-label="loading"
                                    >
                                      <span className="sr-only">Continuing...</span>
                                    </span>
                                    Continuing...
                                  </>
                                ) : (
                                  "Continue"
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/*footer*/}
                {/* <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Save Changes
                  </button>
                </div> */}
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}

      {/* Modal verify code*/}
      {showModalVerify ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-full">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*body*/}
                <div className="relative p-6 flex-auto -mt-10">
                  {/* <button onClick={() => setShowModalVerify(false)}>
                    <img
                      src={(require("../../assets/images/close.png")?.default || require("../../assets/images/close.png"))}
                      alt=""
                      className="w-10 absolute top-14 right-5"
                    />
                  </button> */}
                  <div>
                    <div className="w-4/5 justify-between  m-auto">
                      <div className="h-full  md:gap-5  lg:gap-0">
                        {/* component left */}

                        {/* component right */}
                        <div className="lg:h-full lg:w-11/12 justify-center m-auto">
                          <div className="lg:mt-14">
                            <div>
                              <h1 className="text-3xl font-bold text-primaryColor text-center ">
                                Verify your email address
                              </h1>
                              <p className="text-gray-500 mt-5 text-center">
                                Enter the verification code we just sent you on
                                your email ID
                                <span className="text-primaryColor">
                                  {dataOnchange.email}
                                </span>
                              </p>
                            </div>
                            <div>
                              <div className="">
                                <div className="flex flex-col relative space-y-9">
                                  <div className="mt-10  flex flex-row items-center justify-center mx-auto w-full max-w-xs">
                                    <OtpInput
                                      value={otp}
                                      onChange={setOtp}
                                      numInputs={4}
                                      renderSeparator={<span>-</span>}
                                      renderInput={(props) => (
                                        <input {...props} />
                                      )}
                                      inputStyle={{
                                        border: "1px solid transparent",
                                        borderColor: "#0F766E",
                                        borderRadius: "8px",
                                        width: "54px",
                                        height: "54px",
                                        fontSize: "12px",
                                        color: "#000",
                                        fontWeight: "400",
                                        caretColor: "blue",
                                      }}
                                    />
                                  </div>
                                  {errorVerify ? (
                                    <div className="text-red-400 text-xs bottom-8 left-28 absolute">
                                      Please input code to verify your email
                                    </div>
                                  ) : null}
                                  <div className="flex flex-col space-y-5">
                                    <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                                      <p>Don’t received an email?</p>{" "}
                                      <button
                                        onClick={handleResendVerify}
                                        className="flex flex-row items-center text-primaryColor"
                                      >
                                        Resend email
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* <div>Picked: {values.picked}</div> */}
                          </div>
                          {/* Button */}
                          <div>
                            <button
                              type="button"
                              onClick={onSubmitVerifyEmail}
                              className="mt-7 flex  lg:mt-9 mb-5 items-center justify-center gap-2 rounded-xl bg-primaryColor w-full py-4  text-md font-medium  leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-cyan-400 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                              data-te-ripple-init
                              data-te-ripple-color="light"
                            >
                              {loadingVerifyEmail ? (
                                <>
                                  <span
                                    className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
                                    role="status"
                                    aria-label="loading"
                                  >
                                    <span className="sr-only">Verifying...</span>
                                  </span>
                                  Verifying...
                                </>
                              ) : (
                                "Verify"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </div>
  );
};

export default SignUpPage;
