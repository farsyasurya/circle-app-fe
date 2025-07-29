// redux/index.ts
import { combineReducers } from "@reduxjs/toolkit";
import likeReducer from "./likeSlice";
import authReducer from "./authSlice";

const rootReducer = combineReducers({
  likes: likeReducer,
  auth: authReducer,
});

export default rootReducer;
