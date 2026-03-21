import { Button } from "@/components/ui/button";
import { Field, Form, Formik } from "formik";
import React, { useState, CSSProperties } from "react";
import { ClipLoader, ScaleLoader } from "react-spinners";
import * as Yup from "yup";
import ForgetPasswordModal from "./ForgetPasswordModal";
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email format is valid")
    .required("Email cannot be blank"),
  password: Yup.string()
    .required("Password cannot be blank")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
    ),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("password"), null],
    "Passwords must match"
  ),
});

const SignInPage = () => {
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  const [showCreateNewPassword, setShowCreateNewPassword] = useState(false);
  // show and hide password
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };

  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  return (
    <>
      <div className="sweet-loading mt-56">
        <ScaleLoader color="#0f766e" width={15} />
      </div>
    </>
  );
};

export default SignInPage;
