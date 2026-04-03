import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import instructorReducer from './slices/instructorSlice';
import messageReducer from './slices/messageSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import paymentReducer from './slices/paymentSlice';
import jobReducer from './slices/jobSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    instructor: instructorReducer,
    message: messageReducer,
    subscription: subscriptionReducer,
    payment: paymentReducer,
    job: jobReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
