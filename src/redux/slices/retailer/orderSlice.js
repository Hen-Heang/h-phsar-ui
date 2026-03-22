import { createSlice } from "@reduxjs/toolkit";
const orderSlice=createSlice({
    name:"order",
    initialState:{
        data:[],
        dataDispatch:[],
        loading:false,
        dataDraft:[],
    },
    reducers:{
        setLoadingOrder:(state,action)=>{
            state.loading=action.payload
        },
        getOrderDetail:(state,action)=>{
            state.data=action.payload;
        },
        confirmTransaction:(state,action)=>{
            // const itemId = action.payload;
            // console.log("Hello , ",action.payload)
            state.data.forEach((item)=>{
                if(item.id === action.payload){
                    // console.log("complete id in slice : ",action.payload)
                    item.status = "Complete"
                }
            })
            // state.data= state.data.filter((item) => item.id !== itemId);
        },
        getDraftHis: (state, action) => {
            state.dataDraft = action.payload;
        },
        deleteTheDraft: (state, action) => {
            state.dataDraft = state.dataDraft.filter((item) => item.order.id !== action.payload)    
        },
        draftToRequest1: (state, action) => {
            const itemId = action.payload;
            // state.dataDraft = state.dataDraft
            // .map((item)=>{
            //     if(item.order.id === action.payload){
            //         item.status = "Pending"
            //     }
            // })
            state.dataDraft = state.dataDraft
            // .map((item)=>{
            //     if(item.order.id === action.payload){
            //         item.status = "Pending"
            //     }
            // })
            .filter((item) => item.order.id !== itemId)
        },
        pushToOrder:(state,action)=>{
            state.data.unshift(action.payload);
        },
        deleteRequest:(state,action)=>{
            state.data=state.data.filter((item)=>item.id!== action.payload)
        },
        changeToDeliver:(state,action)=>{
            // const itemId = action.payload;
            // console.log("Hello , ",action.payload)
            state.data.forEach((item)=>{
                if(item.id === action.payload){
                    // console.log("complete id in slice : ",action.payload)
                    item.status = "Dispatching"
                }
            })
            // state.data= state.data.filter((item) => item.id !== itemId);

        },
        setChangeOrderStatus : (state, action) =>{
            state.data.forEach((item)=>{
                if(item.id === parseInt(action.payload, 10)){
                    // console.log("item id", item.id)
                    // console.log("item id", action.payload)
                    // console.log("item state 1: " + item.status)
                    if(item.status === "Pending"){
                        item.status = "Preparing"
                    }else if(item.status === "Preparing"){
                        item.status = "Dispatching"
                    }else if(item.status === "Dispatching"){
                        item.status = "Confirming"
                    }else{
                        item.status = "Complete"
                    }
                }
            })
        },
        setChangeOrderStatusDeclind : (state, action) =>{
            state.data.forEach((item)=>{
                if(item.id === parseInt(action.payload, 10)){
                    // console.log("item id", item.id)
                    item.status = "Declined"
                    // console.log("item id", action.payload)
                    // console.log("item state 1: " + item.status)
                   
                }
            })
        }
    }
})
export const {setChangeOrderStatusDeclind,setChangeOrderStatus,changeToDeliver,getOrderDetail,confirmTransaction,setLoadingOrder,updateDispatch,getDraftHis,deleteTheDraft,draftToRequest1,pushToOrder,deleteRequest}=orderSlice.actions;
export default orderSlice.reducer;
