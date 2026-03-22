import { createSlice } from "@reduxjs/toolkit";

const orderPageSlice=createSlice({
    name:"distributorOrder",
    initialState:{
        orderData:[],
        preData:[],
        disData:[],
        confirmData:[],
        dataComplete:[
        ],
        loading:false,
    },
    reducers:{
        setLoadingTheOrder:(state,action)=>{
            state.loading=action.payload;
        },
        getNewOrder:(state,action)=>{
            state.orderData=action.payload;
        },
        declineNewOrder:(state,action)=>{
            const itemId = action.payload;
            state.orderData= state.orderData.filter((item) => item.id !== itemId);
        },
        acceptOrder:(state,action)=>{
            const itemId = action.payload;
            state.orderData= state.orderData.filter((item) => item.id !== itemId);
        },
        addDataToPrepar:(state,action)=>{
            state.preData.unshift(action.payload);
        },
        getPrepraingOrder:(state,action)=>{
            state.preData=action.payload;
        },
        FinishedOrder:(state,action)=>{
            const itemId = action.payload;
            state.preData= state.preData.filter((item) => item.id !== itemId);
        },
        addDataToDispatch:(state,action)=>{
            state.disData.unshift(action.payload);
        },
        getDispatch:(state,action)=>{
            state.disData=action.payload;
        },
        deliverdOrder:(state,action)=>{
            const itemId = action.payload;
            state.disData= state.disData.filter((item) => item.id !== itemId);
        },
        addDataToConfirm:(state,action)=>{
            state.confirmData.unshift(action.payload)
        },
        getConfirmOrder:(state,action)=>{
            state.confirmData=action.payload;
        },
         setLoadingCompleted:(state,action)=>{
            state.loading=action.payload
        },
        getAllComplete:(state,action)=>{
            state.dataComplete=action.payload;
        },
        setConfirmOrderFromRetailers:(state,action)=>{
            state.confirmData.map((item) =>{
                if(item.id === action.payload){
                    item.status = 'complete'
                    state.dataComplete = item
                    item.filter((data)=> data.id !== action.payload)
                    
                }
            })
        }
    }
});
export const {getAllComplete,setLoadingCompleted,setLoadingTheOrder,getNewOrder,declineNewOrder,acceptOrder,addDataToPrepar,getPrepraingOrder,FinishedOrder,addDataToConfirm,addDataToDispatch,getDispatch,deliverdOrder,getConfirmOrder}=orderPageSlice.actions;
export default orderPageSlice.reducer;