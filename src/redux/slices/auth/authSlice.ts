import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LoginData } from "@/types/auth";

interface AuthState {
  loading: boolean;
  data: LoginData | null;
}

const initialState: AuthState = {
  loading: false,
  data: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setDataLogin: (state, action: PayloadAction<LoginData>) => {
      state.data = action.payload;
    },
  },
});

export const { setDataLogin, setLoading } = authSlice.actions;
export default authSlice.reducer;
