import { apiPost, apiPut } from "@/utils/api";

export const registerService = async ({ email, password }, id) => {
  const data = {
    email,
    password,
    roleId: id?.roleId ?? id,
  };

  return apiPost("/authorization/register", {
    auth: false,
    body: data,
  });
};
export const generateCodeService = async ({ email }) => {
  return apiPost("/authorization/api/v1/otp/generate", {
    auth: false,
    query: { email },
  });
};
export const verifyEmailService = async ({ email }, otp) => {
  return apiPost("/authorization/api/v1/otp/verify", {
    auth: false,
    query: { otp, email },
  });
};

// login
export const loginService = async (data) => {
  return apiPost("/authorization/login", {
    auth: false,
    body: data,
  });
};

export const forget_password = async (data) => {
  const otp = data.otp;
  const email = data.email;
  const password = data.password;

  return apiPut("/authorization/forget", {
    auth: false,
    query: {
      otp,
      email,
      newPassword: password,
    },
  });
};
export const change_password = async (data) => {
  return apiPut("/authorization/change-password", {
    auth: false,
    body: data,
  });
};
