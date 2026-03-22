import { createSlice, current } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "category",
  initialState: {
    categories: [],
    ShowItem: 6,
    currentPage: 1,
    loading: false,
  },

  reducers: {
    setLoadingCategory: (state, action) => {
      state.loading = action.payload;
    },
    onClickCurrentPage: () => {},
    onChangeTodosPage: () => {},
    getAllCategoryDistributor: (state, action) => {
      state.categories = action.payload;
    },
    addNewCategoryDistributor: (state, action) => {
      // console.log("New category :", action.payload);
      state.categories.unshift(action.payload);
    },
    updateCategoryDistributor: (state, action) => {
      const { id, name } = action.payload;
    
      const categoryToUpdate = state.categories.find((category) => category.id === id);
      if (categoryToUpdate) {
        categoryToUpdate.name = name;
      }
    
    },
    deleteCategoryDistributor: (state, action) => {
      // state.categories.map((category) => {
      //   console.log("category ID : ", category.id);
      //   console.log("action ID :", action.payload);
      //   if (category.id === action.payload.id) {
      //     category.name = action.payload.name;
      //   }
      // });
      state.categories = state.categories.filter(
        (category) => category.id !== action.payload
      );
    },
  },
});

export const {
  getAllCategoryDistributor,
  addNewCategoryDistributor,
  deleteCategoryDistributor,
  updateCategoryDistributor,
  onClickCurrentPage,
  onChangeTodosPage,
  setLoadingCategory,
} = categorySlice.actions;
export default categorySlice.reducer;
