"use client";

import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  change_password,
  forget_password,
  generateCodeService,
  loginService,
  verifyEmailService,
} from "../../redux/services/auth/auth.server";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import OTPInput from "react-otp-input";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setDataLogin } from "../../redux/slices/auth/authSlice";
import { PulseLoader, RingLoader } from "react-spinners";
import { Dialog, DialogContent } from "@/components/ui/dialog";
export default function SignInPage() {
  const dispatch = useDispatch();

  // 1. Yup
  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Email Format is invalid")
      .required("Email can't be empty"),
    password: Yup.string()
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
      )
      .min(8)
      .required("PLease enter your passord."),
  });
  const LoginSchema1 = Yup.object().shape({
    email: Yup.string()
      .email("Email Format is invalid")
      .required("Email can't be empty"),
  });
  const LoginSchema4 = Yup.object().shape({
    email: Yup.string()
      .email("Email Format is invalid")
      .required("Email can't be empty"),
  });

  const LoginSchema2 = Yup.object().shape({
    otp: Yup.string()
      .matches(
        /(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/,
        "Accept number only"
      )
      .required("OTP can't be empty"),
    password: Yup.string()
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
      )
      .min(8)
      .required("PLease enter your password."),
  });
  const LoginSchema3 = Yup.object().shape({
    email: Yup.string()
      .email("Email Format is invalid")
      .required("Email can't be empty"),
    oldPassword: Yup.string()
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
      )
      .min(8)
      .required("PLease enter your password."),
    newPassword: Yup.string()
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
      )
      .min(8)
      .required("PLease enter your password."),
  });
  // 2. Show and hide password
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function togglePasswordVisibility() {
    setIsPasswordVisible((prevState) => !prevState);
  }

  const router = useRouter();
  // ======================= login =========================
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const handleLogin = (data) => {
    setLoading(true);
    console.log(navigator.onLine);
    if (!navigator.onLine) {
      toast.error("No internet connection. Please try again later.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setLoading(false);
      return; // Exit the function early
    }
    // console.log(data);
    loginService(data)
      .then((response) => {
        // console.log("useID : " + response.data.data.userId);
        // console.log(response.data);
        if (response.data === "") {
          toast.error(`Something went wrong`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
        if (response.data.detail === "Email does not exist.") {
          toast.error(`Email does not exit..!`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setLoading(false);
        }
        if (
          response.data.detail ===
          "INVALID_PASSWORD. Please input correct password."
        ) {
          {
            toast.error(`Invalid email or password`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            setLoading(false);
          }
        }
        if (response.status === 409) {
          toast.error("Email is not verified");
        }
        if (response.status === 200) {
          // console.log("response : ",response.data.data);
          dispatch(setDataLogin(response.data.data));
          localStorage.setItem("token", response.data.data.token);
          localStorage.setItem("role", response.data.data.roleId);
          localStorage.setItem("email", data.email);
          localStorage.setItem("userId", response.data.data.userId);
          setShowAlert(true);
          // សិក្សា condition between dis and retail
          if (response.data.data.roleId === 1) {
            router.push("/distributor/home");
          } else {
            router.push("/retailer/home");
          }
          if (response.status === 200) {
            // console.log("response : ",response.data.data);
            localStorage.setItem("token", response.data.data.token);
            localStorage.setItem("role", response.data.data.roleId);
            localStorage.setItem("email", data.email);
            setShowAlert(true);
            // សិក្សា condition between dis and retail
            if (response.data.data.roleId === 1) {
              router.push("/distributor/home");
            } else {
              router.push("/retailer/home");
            }
          }
        }
      })
      .catch((error) => {
        console.log("first");
        toast.error(`Something went wrong`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  //   verify email
  const [dataOnchange, setDataOnchange] = useState({
    email: "",
    password: "",
  });
  // console.log(dataOnchange);
  const [loadingOTP, setLoadingOTP] = useState(false);
  const [errorVerify, setErrorVerify] = useState(false);
  const [showModalVerify, setShowModalVerify] = useState(false);
  const [showVerifyCodeOTP, setVerifyCodeOTP] = useState(false);
  const [otp, setOtp] = useState("");

  const onSubmitVerifyEmail = (email) => {
    setLoadingOTP(true);
    generateCodeService(email).then((res) => {
      console.log(res);
      if (res.status === 400) {
        toast.error("This email does not exist");
        setLoadingOTP(false);
      }
      if (res.status === 201) {
        setVerifyCodeOTP(false);
        setLoadingOTP(false);
        // toast.success("The email has been verified successfully")
        setShowModalVerify(true);
      }
      // else {
      //   setVerifyCodeOTP(false)
      //   setLoadingOTP(false);
      //   toast.success("The email has been verified successfully")
      // }
    });
  };
  // submit verify email
  const handleSubmitVerifyEmail = () => {
    if (otp === "") {
      setShowModalVerify(true);
      setErrorVerify(false);
    } else {
      verifyEmailService(dataOnchange, otp).then((res) => {
        if (res.data.status === 200) {
          Swal.fire({
            position: "center",
            icon: "success",
            iconColor: "#0F766E",
            title: "<h1 style='color:#0F766E'>Congratulations!</h1>",
            text: "You have signed up successfully",
            showConfirmButton: false,
            timer: 2500,
          }).then(() => setShowModalVerify(false));
        }
        // navigate("/login");
        else {
          // console.log("Error " + res);
          Swal.fire({
            icon: "error",
            // title: "Oops...",
            html: `<span className="text-red-600">${res.data.detail}</span>`,
          });
        }
      });
    }
  };
  // resend code to verify
  const handleResendVerify = () => {
    let timerInterval;
    Swal.fire({
      title: "<h1 style='color:#0F766E'>Generating code !</h1>",
      html: "Please wait for a few seconds",
      timer: 20000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector("b");
        // timerInterval = setInterval(() => {
        //   b.textContent = Swal.getTimerLeft();
        // }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
      }
    });
  };

  // =======================  forgot password ======================

  const [successOTP, setSuccessOTP] = useState(false);
  const [passwordUpdate, setPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  const [showCreateNewPassword, setShowCreateNewPassword] = useState(false);
  const [dataEmail, setDataEmail] = useState(false);
  const [loadingSetPassword, setLoadingSetPassword] = useState(false);
  // handle forgot password
  // Show the new popup and hide the old popup.
  const handleResetClick = (data) => {
    setDataEmail(data);
    setLoadingOTP(true);
    generateCodeService(data)
      .then((res) => {
        if (res.status === 400) {
          toast.error("This email does not exist");
          setLoadingOTP(false);
        } else {
          setLoadingOTP(false);
          setShowForgetPassword(false);
          setShowEmail(true);
        }
      })
      .then(() => {});
    // console.log(data);
    // setShowForgetPassword(false);
    // setShowEmail(true);
  };
  const handleBackClick = () => {
    setShowForgetPassword(true);
    setShowEmail(false);
  };
  const handleContinueClick = (data) => {
    setLoadingSetPassword(true);
    forget_password(data).then((res) => {
      if (res.status === 200) {
        setShowEmail(false);
        setPasswordUpdate(true);
        setLoadingSetPassword(false);
      } else {
        toast.error(res.data.detail);
        setLoadingSetPassword(false);
      }
    });
    console.log(data);
  };
  const handleCancelClick = () => {
    setShowEmail(true);
    setNewPassword(false);
  };
  const handleSaveClick = () => {
    setNewPassword(false);
    setPasswordUpdate(true);
  };
  const handleUnsaveClick = () => {
    setNewPassword(true);
    setPasswordUpdate(false);
  };
  //
  //

  // show and hide password
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };

  const handleSubmitForgotPassword = (data) => {
    console.log("asdfghjkl");
    console.log("Data :", data);
    setShowCreateNewPassword(true);
  };

  // const test =()=>{
  //   toast.success("You have login successfully..!", {
  //     position: "top-right",
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //     theme: "light",
  //   });
  // }

  // ============================= change password =============================
  // change password
  const [loadingChangePassword, setLoadingChangePassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const handleUpdatePasswordClick = (data) => {
    console.log(data);
    setLoadingChangePassword(true);
    console.log(loadingChangePassword);
    change_password(data).then((res) => {
      if (res.status === 200) {
        setChangePassword(false);
        setLoadingChangePassword(false);
        setPasswordChangeSuccess(true);
      } else {
        toast.error(res.data.detail);
        setLoadingChangePassword(false);
      }
    });
  };
  const handleBackUpdatePasswordClick = () => {
    setChangePassword(true);
    setPasswordChangeSuccess(false);
  };
  return (
    <section className="bg-backGroundColor h-screen">
      {/* ========================== loading otp ================== */}
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

      {showAlert ? (
        <div
          id="dismiss-alert"
          className="hs-removing:translate-x-5 hs-removing:opacity-0 transition duration-300 bg-teal-50 border border-teal-200 rounded-md p-4"
          role="alert"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 text-teal-400 mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
            </div>
            <div className="ml-3">
              <div className="text-sm text-teal-800 font-medium">
                File has been successfully uploaded.
              </div>
            </div>
            <div className="pl-3 ml-auto">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex bg-teal-50 rounded-md p-1.5 text-teal-500 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-teal-50 focus:ring-teal-600"
                  data-hs-remove-element="#dismiss-alert"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-3 w-3"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M0.92524 0.687069C1.126 0.486219 1.39823 0.373377 1.68209 0.373377C1.96597 0.373377 2.2382 0.486219 2.43894 0.687069L8.10514 6.35813L13.7714 0.687069C13.8701 0.584748 13.9882 0.503105 14.1188 0.446962C14.2494 0.39082 14.3899 0.361248 14.5321 0.360026C14.6742 0.358783 14.8151 0.38589 14.9468 0.439762C15.0782 0.493633 15.1977 0.573197 15.2983 0.673783C15.3987 0.774389 15.4784 0.894026 15.5321 1.02568C15.5859 1.15736 15.6131 1.29845 15.6118 1.44071C15.6105 1.58297 15.5809 1.72357 15.5248 1.85428C15.4688 1.98499 15.3872 2.10324 15.2851 2.20206L9.61883 7.87312L15.2851 13.5441C15.4801 13.7462 15.588 14.0168 15.5854 14.2977C15.5831 14.5787 15.4705 14.8474 15.272 15.046C15.0735 15.2449 14.805 15.3574 14.5244 15.3599C14.2437 15.3623 13.9733 15.2543 13.7714 15.0591L8.10514 9.38812L2.43894 15.0591C2.23704 15.2543 1.96663 15.3623 1.68594 15.3599C1.40526 15.3574 1.13677 15.2449 0.938279 15.046C0.739807 14.8474 0.627232 14.5787 0.624791 14.2977C0.62235 14.0168 0.730236 13.7462 0.92524 13.5441L6.59144 7.87312L0.92524 2.20206C0.724562 2.00115 0.611816 1.72867 0.611816 1.44457C0.611816 1.16047 0.724562 0.887983 0.92524 0.687069Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="w-4/5 lg:w-3/6 h-screen flex m-auto flex-col justify-evenly">
        <div className="md:h-4/6 lg:h-5/6 grid grid-cols-2">
          {/*1.Form */}
          <div className=" col-span-2 lg:col-span-1 w-full flex flex-col justify-center bg-white shadow dark:border md:mt-0 rounded-xl lg:rounded-r-none dark:bg-gray-800 dark:border-gray-700">
            <div className=" p-6 space-y-1 md:space-y-2 sm:px-11">
              <h1 className=" text-xl lg:text-3xl font-bold text-center leading-tight tracking-tight text-primaryColor md:text-2xl dark:text-white">
                Keep Connected
              </h1>
              <p className="text-logInText text-center relative">
                Login to get access to your account
              </p>

              <Formik
                initialValues={{
                  email: "",
                  password: "",
                }}
                validationSchema={LoginSchema}
                onSubmit={(values) => {
                  //   console.log(values);
                  handleLogin(values);
                  setDataOnchange(values);
                  localStorage.setItem("email", values.email);
                }}
              >
                {({ errors, touched }) => (
                  <Form className="pt-5 space-y-2 md:space-y-3" action="#">
                    <div className="relative">
                      <img
                        src={(require("../../assets/images/emailIcon.png")?.default || require("../../assets/images/emailIcon.png"))}
                        alt=""
                        className="absolute top-3 right-3 w-5"
                      />
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className={`${
                          errors.email && touched.email
                            ? "focus:ring-red-500 border-red-500 focus:outline-none focus:border-red-100 bg-gray-50 border-1  text-black text-xs sm:text-sm rounded-lg block w-full p-2.5"
                            : "bg-gray-50 border-1 border-primaryColor text-black text-xs sm:text-sm rounded-lg focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5"
                        }`}
                        placeholder="Email"
                        required=""
                      />
                      {errors.email && touched.email ? (
                        <span className="text-xs text-red-500">
                          {errors.email}
                        </span>
                      ) : null}
                    </div>

                    <div className="relative">
                      <div
                        className="absolute top-3 right-3 w-5 cursor-pointer"
                        onClick={togglePasswordVisibility}
                      >
                        {isPasswordVisible ? (
                          <img
                            src={(require("../../assets/images/show.png")?.default || require("../../assets/images/show.png"))}
                            alt=""
                          />
                        ) : (
                          <img
                            src={(require("../../assets/images/hide (1) 1.png")?.default || require("../../assets/images/hide (1) 1.png"))}
                            alt=""
                          />
                        )}
                      </div>
                      <Field
                        type={isPasswordVisible ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="Password"
                        className={`${
                          errors.password && touched.password
                            ? "focus:ring-red-500 border-red-500 focus:outline-none focus:border-red-100 bg-gray-50 border-1  text-black text-xs sm:text-sm rounded-lg block w-full p-2.5"
                            : "bg-gray-50 border-1 border-primaryColor text-black text-xs sm:text-sm rounded-lg focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5"
                        }`}
                      />
                      {errors.password && touched.password ? (
                        <span className="text-xs text-red-500">
                          {errors.password}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-center">
                      {loading ? (
                        <button
                          className="bg-primaryColor flex justify-center gap-5 items-center hover:bg-primaryColor text-white font-bold space-y-4 md:space-y-6 w-full p-2 md:p-1 md:text-lg text-xs rounded-lg focus:outline-none focus:shadow-outline"
                          type="submit"
                        >
                          <span
                            className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
                            role="status"
                            aria-label="loading"
                          >
                            <span className="sr-only">Loading...</span>
                          </span>
                          Sign in...
                        </button>
                      ) : (
                        <button
                          className="bg-primaryColor hover:bg-primaryColor text-white uppercase text-sm space-y-4 md:space-y-6 w-full p-2 md:p-1 md:text-lg rounded-lg focus:outline-none focus:shadow-outline"
                          type="submit"
                        >
                          Sign in
                        </button>
                      )}
                    </div>
                    <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
                      <p className="mx-4 mb-0 text-center text-logInText font-thin text-xs md:text-sm dark:text-gray-300">
                        Or
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => setVerifyCodeOTP(true)}
                        className="text-primaryColor text-xs font-medium hover:underline dark:text-primary-500 cursor-pointer underline"
                      >
                        Verify email
                      </div>
                      <div
                        onClick={() => setChangePassword(true)}
                        className="text-primaryColor text-xs font-medium hover:underline dark:text-primary-500 cursor-pointer underline"
                      >
                        Change password
                      </div>
                      <div
                        onClick={() => setShowForgetPassword(true)}
                        className="text-primaryColor text-xs font-medium hover:underline dark:text-primary-500 cursor-pointer underline"
                      >
                        Forgot password?
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-center font-light text-logInText dark:text-gray-400">
                      Don’t have an account?
                      <Link
                        href="/sign-up"
                        className="text-sm md:text-base font-medium pl-3 text-primaryColor hover:underline dark:text-primary-500"
                      >
                        Sign up
                      </Link>
                    </p>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
          {/* form */}
          {/*2.Image */}
          <div className="col-span-1 relative hidden lg:block sign_in_bg">
            <div className="absolute inset-0 h-full w-full overflow-hidden rounded-r-xl bg-gradient-to-br from-primaryColor/72 via-primaryColor/58 to-slate-900/38">
              <div className="mx-auto flex h-full w-4/5 max-w-md flex-col justify-center rounded-r-xl px-2">
                <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-sm xl:text-5xl">
                  Save money, time <br /> and energy with our platform
                </h1>
                <p className="pt-4 text-xl font-semibold text-white/95">
                  Find your business partner today!
                </p>
              </div>
            </div>
          </div>
          {/* image */}
        </div>
      </div>
      {/* Modal verify code*/}
      {showModalVerify ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-full">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*body*/}
                <div className="relative p-6 flex-auto -mt-10">
                  <button onClick={() => setShowModalVerify(false)}>
                    <img
                      src={(require("../../assets/images/close.png")?.default || require("../../assets/images/close.png"))}
                      alt=""
                      className="w-10 absolute top-14 right-5"
                    />
                  </button>
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
                                    <OTPInput
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
                              onClick={handleSubmitVerifyEmail}
                              className="mt-7 lg:mt-9 mb-5 inline-block rounded-xl bg-primaryColor w-full py-4  text-sm font-medium  leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-cyan-400 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                              data-te-ripple-init
                              data-te-ripple-color="light"
                            >
                              Verify
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

      {/*===> forgot password and create new password */}
      {/* 1. forgrt password popup*/}
      {showVerifyCodeOTP ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            {/* <div className="relative w-auto my-6 mx-auto max-w-4xl "> */}
            <div className="relative my-6 mx-auto w-11/12 lg:w-2/5">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full lg:w-2/3 h-full lg:h-[300px] mx-auto bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className=" flex items-start justify-between p-3 border-b border-solid bg-primaryColor border-slate-200 rounded-t">
                  <button
                    className=" mr-auto bg-transparent border-0 text-black float-left text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setVerifyCodeOTP(false)}
                  >
                    <img
                      src={(require("../../assets/images/Group 119.png")?.default || require("../../assets/images/Group 119.png"))}
                      alt=""
                      className="w-10"
                    />
                  </button>
                </div>
                {/* body */}
                <div className="relative p-6 flex-auto ">
                  <div className=" justify-center items-center m-auto h-full">
                    <div>
                      <div>
                        <div className="flex justify-center ">
                          <p className="text-2xl mb-10">
                            Please input your email to verify
                          </p>
                        </div>
                        <div className="m-auto w-4/5">
                          <Formik
                            initialValues={{ email: "" }}
                            validationSchema={LoginSchema1}
                            onSubmit={(values) => {
                              onSubmitVerifyEmail(values);
                            }}
                          >
                            {({ errors, touched }) => (
                              <Form>
                                {/* <!--Logo--> */}

                                {/* Field field */}
                                <div>
                                  <div className="flex flex-wrap flex-col gap-5">
                                    {/* email */}
                                    <div className="relative">
                                      <Field
                                        name="email"
                                        placeholder="Email"
                                        className={`border border-primaryColor text-gray-900 text-sm rounded-lg ${
                                          errors.email && touched.email
                                            ? "focus:ring-red-500 border-red-500 focus:outline-none"
                                            : null
                                        }  focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none`}
                                      />
                                      {errors.email && touched.email ? (
                                        <div className="text-red-400 text-xs mt-1">
                                          {errors.email}
                                        </div>
                                      ) : null}
                                    </div>

                                    <button
                                      // type="submit"
                                      type="submit"
                                      // onClick={handleResetClick}
                                      className="inline-block rounded mb-5 bg-primaryColor px-7 pb-2.5 pt-2.5 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                                    >
                                      verify
                                    </button>
                                  </div>
                                </div>
                              </Form>
                            )}
                          </Formik>
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
      {showForgetPassword ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            {/* <div className="relative w-auto my-6 mx-auto max-w-4xl "> */}
            <div className="relative my-6 mx-auto w-11/12 lg:w-2/5">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full lg:w-2/3 h-full lg:h-[520px] mx-auto bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className=" flex items-start justify-between p-3 border-b border-solid bg-primaryColor border-slate-200 rounded-t">
                  <button
                    className=" mr-auto bg-transparent border-0 text-black float-left text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowForgetPassword(false)}
                  >
                    <img
                      src={(require("../../assets/images/Group 119.png")?.default || require("../../assets/images/Group 119.png"))}
                      alt=""
                      className="w-10"
                    />
                  </button>
                </div>
                {/* body */}
                <div className="relative p-6 flex-auto mt-10">
                  <div className="w-4/5 justify-center items-center m-auto h-full">
                    <div>
                      <div>
                        <h1 className="text-3xl font-bold">
                          Forget Password ?
                        </h1>
                        <p className="text-gray-500 mt-5 mb-16">
                          Provide us your email address and we'll guide you to
                          reset your password.
                        </p>
                        <div className="m-auto">
                          <Formik
                            initialValues={{ email: "" }}
                            validationSchema={LoginSchema4}
                            onSubmit={(values) => {
                              // same shape as initial values
                              console.log("forgot : ", values);
                              // handleSubmitForgotPassword(values);
                              handleResetClick(values);
                            }}
                          >
                            {({ errors, touched }) => (
                              <Form>
                                {/* <!--Logo--> */}

                                {/* Field field */}
                                <div>
                                  <div className="flex flex-wrap flex-col gap-5">
                                    {/* email */}
                                    <div className="relative">
                                      <Field
                                        name="email"
                                        placeholder="Email"
                                        className={`border border-primaryColor text-gray-900 text-sm rounded-lg ${
                                          errors.email && touched.email
                                            ? "focus:ring-red-500 border-red-500 focus:outline-none"
                                            : null
                                        }  focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none`}
                                      />
                                      {errors.email && touched.email ? (
                                        <div className="text-red-400 text-xs mt-1">
                                          {errors.email}
                                        </div>
                                      ) : null}
                                    </div>

                                    <button
                                      // type="submit"
                                      type="submit"
                                      // onClick={handleResetClick}
                                      className="inline-block rounded mb-5 bg-primaryColor px-7 pb-2.5 pt-2.5 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                                    >
                                      Reset Password
                                    </button>
                                  </div>
                                </div>
                              </Form>
                            )}
                          </Formik>
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
      {/* show verify code and email popup*/}
      {showEmail ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative my-6 mx-auto w-11/12 lg:w-2/5 ">
              {/*content*/}
              <div className="border-0  rounded-lg shadow-lg relative flex flex-col w-full lg:w-2/3 h-full lg:h-[520px] mx-auto bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className=" flex items-start justify-between p-3 border-b border-solid bg-primaryColor border-slate-200 rounded-t">
                  <button
                    className="mr-auto bg-transparent border-0 text-black float-left text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={handleBackClick}
                  >
                    <img
                      src={(require("../../assets/images/Group 119.png")?.default || require("../../assets/images/Group 119.png"))}
                      alt=""
                      className="w-10"
                    />
                  </button>
                </div>
                {/* body */}
                <div className="relative p-6 flex-auto lg:mt-5">
                  <div className="w-4/5 justify-center items-center m-auto h-full">
                    <div>
                      <div>
                        <h1 className="text-3xl font-bold">
                          Enter security code
                        </h1>
                        <p className="text-gray-500 mt-5 mb-5">
                          Please check your emails for a message with your code.
                          Your code is 4 numbers long.
                        </p>
                        <div className="m-auto">
                          <Formik
                            initialValues={{ otp: "", password: "" }}
                            validationSchema={LoginSchema2}
                            onSubmit={(values) => {
                              // same shape as initial values
                              console.log("forgot : ", values);
                              handleContinueClick({
                                ...values,
                                email: dataEmail.email,
                              });
                              // handleSubmitForgotPassword(values);
                            }}
                          >
                            {({ errors, touched }) => (
                              <Form>
                                <div>
                                  <div className="flex flex-wrap flex-col gap-5">
                                    {/* code */}
                                    <div className="relative flex flex-col gap-3">
                                      <div>
                                        <Field
                                          name="otp"
                                          placeholder="Enter OTP code"
                                          type="text"
                                          pattern="\d{1,5}"
                                          className="border relative border-primaryColor text-gray-900 text-sm rounded-lg  focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
                                        />
                                        {errors.otp && touched.otp ? (
                                          <div className="text-red-400 text-xs mt-1 ml-2">
                                            {errors.otp}
                                          </div>
                                        ) : null}
                                      </div>
                                      <div>
                                        <Field
                                          name="password"
                                          placeholder="Enter new password"
                                          type="text"
                                          className="border border-primaryColor text-gray-900 text-sm rounded-lg  focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
                                        />
                                        {errors.password && touched.password ? (
                                          <div className="text-red-400 text-xs mt-1 ml-2">
                                            {errors.password}
                                          </div>
                                        ) : null}
                                      </div>

                                      {/* <p className="mt-5 text-gray-500 text-xs">
                                        We sent your code to:
                                      </p> */}
                                      {/* Email */}
                                      {/* <Field
                                        type="email"
                                        id="email"
                                        name="email"
                                        className=" bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none placeholder:text-gray-400"
                                        value={localStorage.getItem("email")}
                                        disabled
                                      /> */}
                                      <div className="flex gap-1 mt-1 items-center">
                                        <p className="text-xs">
                                          If you didn't receive a code.
                                        </p>
                                        <div
                                          onClick={() =>
                                            handleResetClick(dataEmail)
                                          }
                                          className="text-primaryColor text-sm font-medium cursor-pointer"
                                        >
                                          Resend
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      // type="submit"
                                      type="submit"
                                      // onClick={handleContinueClick}
                                      className=" flex justify-center items-center gap-2 rounded mb-5 bg-primaryColor px-7 pb-2.5 pt-2.5 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                                    >
                                      {loadingSetPassword ? (
                                        <>
                                          <span
                                            className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
                                            role="status"
                                            aria-label="loading"
                                          >
                                            <span className="sr-only">
                                              Updating...
                                            </span>
                                          </span>
                                          Updating...
                                        </>
                                      ) : (
                                        "Update"
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </Form>
                            )}
                          </Formik>
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
      {/* show set new password popup*/}
      {newPassword ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative my-6 mx-auto w-11/12 lg:w-2/5">
              {/*content*/}
              <div className="border-0  rounded-lg shadow-lg relative flex flex-col w-full lg:w-2/3 h-full lg:h-[520px] mx-auto bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className=" flex items-start justify-between p-3 border-b border-solid bg-primaryColor border-slate-200 rounded-t">
                  <button
                    className="mr-auto bg-transparent border-0 text-black float-left text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={handleCancelClick}
                  >
                    <img
                      src={(require("../../assets/images/Group 119.png")?.default || require("../../assets/images/Group 119.png"))}
                      alt=""
                      className="w-10"
                    />
                  </button>
                </div>
                {/* body */}
                <div className="relative p-6 flex-auto">
                  <div className="w-4/5 justify-center items-center m-auto h-full">
                    <div>
                      <div>
                        <h1 className="text-3xl font-bold">
                          Create new password
                        </h1>
                        <p className="text-gray-500 mt-5 mb-16">
                          Your new password must me different from previous used
                          passwords.
                        </p>
                        <div className="m-auto">
                          <Formik
                            initialValues={{ email: "" }}
                            validationSchema={LoginSchema}
                            onSubmit={(values) => {
                              // same shape as initial values
                              // console.log("forgot : ", values);
                              // handleSubmitForgotPassword(values);
                            }}
                          >
                            {({ errors, touched }) => (
                              <Form>
                                <div>
                                  <div className="flex flex-wrap flex-col gap-5">
                                    {/* password */}
                                    <div className="relative">
                                      <div
                                        className="absolute top-3 right-3 w-5 cursor-pointer"
                                        onClick={togglePasswordVisibility}
                                      >
                                        {isPasswordVisible ? (
                                          <img
                                            src={(require("../../assets/images/show.png")?.default || require("../../assets/images/show.png"))}
                                            alt=""
                                          />
                                        ) : (
                                          <img
                                            src={(require("../../assets/images/hide (1) 1.png")?.default || require("../../assets/images/hide (1) 1.png"))}
                                            alt=""
                                          />
                                        )}
                                      </div>
                                      <Field
                                        type={
                                          isPasswordVisible
                                            ? "text"
                                            : "password"
                                        }
                                        name="password"
                                        id="password"
                                        placeholder="New password"
                                        className={`${
                                          errors.password && touched.password
                                            ? "focus:ring-red-500 border-red-500 focus:outline-none focus:border-red-100 bg-gray-50 border-1  text-black text-xs sm:text-sm rounded-lg block w-full p-2.5"
                                            : "bg-gray-50 border-1 border-primaryColor text-black text-xs sm:text-sm rounded-lg focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5"
                                        }`}
                                      />
                                      {errors.password && touched.password ? (
                                        <span className="text-xs text-red-500">
                                          {errors.password}
                                        </span>
                                      ) : null}
                                    </div>
                                    <button
                                      // type="submit"
                                      type="button"
                                      onClick={handleSaveClick}
                                      className="inline-block rounded mb-5 bg-primaryColor px-7 pb-2.5 pt-2.5 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              </Form>
                            )}
                          </Formik>
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
      {/* show password updated popup */}
      {passwordUpdate ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative my-6 mx-auto w-11/12 lg:w-2/5">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full lg:w-2/3 h-full lg:h-[520px] mx-auto bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className=" flex items-start justify-between p-3 border-b border-solid bg-primaryColor border-slate-200 rounded-t">
                  <button
                    className=" mr-auto bg-transparent border-0 text-black float-left text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={handleCancelClick}
                  >
                    <img
                      src={(require("../../assets/images/Group 119.png")?.default || require("../../assets/images/Group 119.png"))}
                      alt=""
                      className="w-10"
                    />
                  </button>
                </div>
                {/* body */}
                <div className="relative p-6 flex-auto lg:mt-16">
                  <div className="w-4/5 justify-center items-center m-auto h-full">
                    <div>
                      <div className="m-auto">
                        <h1 className="text-3xl font-bold text-center mb-10">
                          Password updated
                        </h1>
                        <img
                          src={(require("../../assets/images/success.png")?.default || require("../../assets/images/success.png"))}
                          alt=""
                          className="w-12 mx-auto"
                        />
                        <p className="text-gray-500 mt-5 mb-5 text-center">
                          Your password has been updated...!
                        </p>
                        <div className="flex flex-wrap flex-col gap-5">
                          <button
                            // type="submit"
                            type="button"
                            onClick={() => setPasswordUpdate(false)}
                            className="inline-block rounded mb-5 bg-primaryColor px-7 pb-2.5 pt-2.5 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                          >
                            Login
                          </button>
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

      {/* 2. create new password */}
      {showCreateNewPassword ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-4xl ">
              {/*content*/}
              <div className="border-0  rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className=" flex items-start justify-between p-3 border-b border-solid bg-primaryColor border-slate-200 rounded-t">
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowCreateNewPassword(false)}
                  >
                    <img
                      src={(require("../../assets/images/closeWhite.png")?.default || require("../../assets/images/closeWhite.png"))}
                      alt=""
                    />
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  <div className="w-4/5 justify-center items-center m-auto h-full">
                    <div>
                      <div>
                        <h1 className="text-3xl font-bold">
                          Forget Password ?
                        </h1>
                        <p className="text-gray-500 mt-7 mb-7">
                          Provide us your email address and we'll guide you to
                          reset your password.
                        </p>
                        <div className="m-auto">
                          <Formik
                            initialValues={{ password: "" }}
                            validationSchema={LoginSchema}
                            onSubmit={(values) => {
                              // same shape as initial values
                              console.log(values);
                            }}
                          >
                            {({ errors, touched }) => (
                              <Form>
                                {/* <!--Logo--> */}

                                {/* Field field */}
                                <div>
                                  <div className="flex flex-wrap flex-col gap-5">
                                    {/* Password */}
                                    <div className="relative">
                                      <img
                                        onClick={togglePasswordVisiblity}
                                        className="absolute top-2.5 right-2 w-6"
                                        src={(require("../../assets/images/eye_hidden_password.png")?.default || require("../../assets/images/eye_hidden_password.png"))}
                                        alt=""
                                      />
                                      <Field
                                        type={
                                          passwordShown ? "text" : "password"
                                        }
                                        name="password"
                                        aria-describedby="helper-text-explanation"
                                        className={`border border-primaryColor text-gray-900 text-sm rounded-lg ${
                                          errors.email && touched.email
                                            ? "focus:ring-red-500 border-red-500 focus:outline-none"
                                            : null
                                        } focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none`}
                                        placeholder="Password"
                                      />
                                      {errors.password && touched.password ? (
                                        <div className="text-red-400 text-xs mt-1">
                                          {errors.password}
                                        </div>
                                      ) : null}
                                    </div>

                                    {/* Conform password */}
                                    <div className="relative">
                                      <img
                                        onClick={togglePasswordVisiblity}
                                        className="absolute top-2.5 right-2 w-6"
                                        src={(require("../../assets/images/eye_hidden_password.png")?.default || require("../../assets/images/eye_hidden_password.png"))}
                                        alt=""
                                      />
                                      <Field
                                        type={
                                          passwordShown ? "text" : "password"
                                        }
                                        name="confirmPassword"
                                        aria-describedby="helper-text-explanation"
                                        className={`border border-primaryColor text-gray-900 text-sm rounded-lg ${
                                          errors.email && touched.email
                                            ? "focus:ring-red-500 border-red-500 focus:outline-none"
                                            : null
                                        } focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none`}
                                        placeholder="Confirm password"
                                      />
                                      {errors.confirmPassword &&
                                      touched.confirmPassword ? (
                                        <div className="text-red-400 text-xs mt-1">
                                          {errors.confirmPassword}
                                        </div>
                                      ) : null}
                                    </div>
                                    <button
                                      type="button"
                                      className="inline-block rounded mb-5 bg-primaryColor px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                                      data-te-ripple-init
                                      data-te-ripple-color="light"
                                    >
                                      Reset
                                    </button>
                                  </div>
                                </div>
                              </Form>
                            )}
                          </Formik>
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
      {/* --Change password-- */}
      {changePassword ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative my-6 mx-auto w-11/12 lg:w-2/5">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full lg:w-2/3 h-full lg:h-[520px] mx-auto bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className=" flex items-start justify-between p-3 border-b border-solid bg-primaryColor border-slate-200 rounded-t">
                  <button
                    className=" mr-auto bg-transparent border-0 text-black float-left text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setChangePassword(false)}
                  >
                    <img
                      src={(require("../../assets/images/Group 119.png")?.default || require("../../assets/images/Group 119.png"))}
                      alt=""
                      className="w-10"
                    />
                  </button>
                </div>
                {/* body */}
                <div className="relative p-6 flex-auto">
                  <div className="w-4/5 flex justify-center items-center m-auto h-full">
                    <div>
                      <div>
                        <h1 className="text-3xl font-bold">Change Password</h1>
                        <p className="text-gray-500 mt-5 mb-7">
                          Make sure you remember your password
                        </p>
                        <div className="m-auto">
                          <Formik
                            initialValues={{
                              email: "",
                              oldPassword: "",
                              newPassword: "",
                            }}
                            validationSchema={LoginSchema3}
                            onSubmit={(values) => {
                              console.log(values);
                              handleUpdatePasswordClick(values);
                              // same shape as initial values
                              // handleSubmit(values);
                            }}
                          >
                            {({ errors, touched }) => (
                              <Form>
                                <div>
                                  <div className="flex flex-wrap flex-col gap-5">
                                    {/* email */}
                                    <div className="relative">
                                      <Field
                                        name="email"
                                        placeholder="Your email"
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

                                    {/*Current Password */}
                                    <div className="relative">
                                      <div
                                        className="absolute top-2.5 right-2 w-5 cursor-pointer"
                                        onClick={togglePasswordVisibility}
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
                                        type={
                                          isPasswordVisible
                                            ? "text"
                                            : "password"
                                        }
                                        name="oldPassword"
                                        className={`border border-primaryColor text-gray-900 text-sm rounded-lg ${
                                          errors.oldPassword &&
                                          touched.oldPassword
                                            ? "focus:ring-red-500 border-red-500 focus:outline-none focus:border-red-100"
                                            : null
                                        } focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primaryColor dark:focus:border-primaryColor focus:outline-none`}
                                        placeholder="Your current password"
                                      />
                                      {errors.oldPassword &&
                                      touched.oldPassword ? (
                                        <div className="text-red-400 text-xs mt-1 ml-2">
                                          {errors.oldPassword}
                                        </div>
                                      ) : null}
                                    </div>
                                    {/* New password */}
                                    <div className="relative">
                                      <div
                                        className="absolute top-2.5 right-2 w-5 cursor-pointer"
                                        onClick={togglePasswordVisibility}
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
                                        type={
                                          isPasswordVisible
                                            ? "text"
                                            : "password"
                                        }
                                        name="newPassword"
                                        className={`border border-primaryColor text-gray-900 text-sm rounded-lg ${
                                          errors.newPassword &&
                                          touched.newPassword
                                            ? "focus:ring-red-500 border-red-500 focus:outline-none focus:border-red-100"
                                            : null
                                        } focus:ring-primaryColor focus:border-primaryColor block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primaryColor dark:focus:border-primaryColor focus:outline-none`}
                                        placeholder="Your new password"
                                      />
                                      {errors.newPassword &&
                                      touched.newPassword ? (
                                        <div className="text-red-400 text-xs mt-1 ml-2">
                                          {errors.newPassword}
                                        </div>
                                      ) : null}
                                    </div>

                                    <button
                                      type="submit"
                                      // type="button"
                                      // onClick={handleUpdatePasswordClick}
                                      className="flex gap-2 justify-center rounded bg-primaryColor px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                                    >
                                      {loadingChangePassword ? (
                                        <>
                                          <span
                                            className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
                                            role="status"
                                            aria-label="loading"
                                          >
                                            <span className="sr-only">
                                              Updating...
                                            </span>
                                          </span>
                                          Updating...
                                        </>
                                      ) : (
                                        "Update Password"
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </Form>
                            )}
                          </Formik>
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
      {/* show password updated popup */}
      {passwordChangeSuccess ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative my-6 mx-auto w-11/12 lg:w-2/5">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full lg:w-2/3 h-full lg:h-[520px] mx-auto bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className=" flex items-start justify-between p-3 border-b border-solid bg-primaryColor border-slate-200 rounded-t">
                  <button
                    className=" mr-auto bg-transparent border-0 text-black float-left text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={handleBackUpdatePasswordClick}
                  >
                    <img
                      src={(require("../../assets/images/Group 119.png")?.default || require("../../assets/images/Group 119.png"))}
                      alt=""
                      className="w-10"
                    />
                  </button>
                </div>
                {/* body */}
                <div className="relative p-6 flex-auto">
                  <div className="w-4/5 flex justify-center items-center m-auto h-full">
                    <div>
                      <div className="m-auto">
                        <h1 className="text-3xl font-bold text-center mb-10">
                          Password updated
                        </h1>
                        <img
                          src={(require("../../assets/images/success.png")?.default || require("../../assets/images/success.png"))}
                          alt=""
                          className="w-12 mx-auto"
                        />
                        <p className="text-gray-500 mt-5 mb-5 text-center">
                          Your password has been updated!
                        </p>
                        <div className="flex flex-wrap flex-col gap-5">
                          <button
                            // type="submit"
                            type="button"
                            onClick={() => setPasswordChangeSuccess(false)}
                            className="inline-block rounded bg-primaryColor px-7 pb-2.5 pt-2.5 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                          >
                            Login
                          </button>
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
      {/* ----------------- */}
    </section>
  );
}
