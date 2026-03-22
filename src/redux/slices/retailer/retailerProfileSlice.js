import { createSlice } from "@reduxjs/toolkit";

const retailerInfoSlice = createSlice({
    name: 'retailerInfo',
    initialState: {
        retailerInfo: {
            firstName: "",
            lastName: "",
            gender: "",
            address: "",
            primaryPhoneNumber: "",
            profileImage: "",
            additionalPhoneNumber: [],
        },
        loading: false,
        error: null,
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        getRetailerInfo: (state, action) => {
            state.retailerInfo = action.payload;
            state.loading = false;
            state.error = null;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
});

export const { getRetailerInfo, setLoading, setError } = retailerInfoSlice.actions;
export default retailerInfoSlice.reducer;
