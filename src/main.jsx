import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import { injectStore } from './config/axiosInstance';
import { setToken, resetAuth } from './store/slices/authSlice';
import './index.css';
import App from './App.jsx';

injectStore(store, { setToken, resetAuth });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
