import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "./slice/authSlice";

// Define RootState type
export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
});

// Infer RootState type from rootReducer
export type RootState = ReturnType<typeof rootReducer>;
