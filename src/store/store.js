import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import instructorReducer from "./slices/instructorSlice";
import messageReducer from "./slices/messageSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import paymentReducer from "./slices/paymentSlice";
import jobReducer from "./slices/jobSlice";
import growReducer from "./slices/growSlice";
import postReducer from "./slices/postSlice";
import reviewReducer from "./slices/reviewSlice";
import dashboardReducer from "./slices/dashboardSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    instructor: instructorReducer,
    message: messageReducer,
    subscription: subscriptionReducer,
    payment: paymentReducer,
    job: jobReducer,
    grow: growReducer,
    post: postReducer,
    review: reviewReducer,
    dashboard: dashboardReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
