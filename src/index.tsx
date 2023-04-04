import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './index.css';
import HomeZh from './zh/Home';
import LoginZh from './zh/Login';
import RegisterZh from './zh/Register';
import HomeEn from './en/Home';
import LoginEn from './en/Login';
import RegisterEn from './en/Register';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeZh />,
  },
  {
    path: "/login",
    element: <LoginZh />,
  },
  {
    path: "/register",
    element: <RegisterZh />,
  },
  {
    path: "/en",
    element: <HomeEn />,
  },
  {
    path: "/en/login",
    element: <LoginEn />,
  },
  {
    path: "/en/register",
    element: <RegisterEn />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <RouterProvider router={router} />
    </LocalizationProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
