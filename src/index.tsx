import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter
} from "react-router-dom";

import './index.css';
import App from './App';

// const router = createBrowserRouter([
//   {
//     path: "/app",
//     element: <App />,
//   },
//   {
//     path: "/",
//     element: <Home strings={stringsZh} />,
//   },
//   {
//     path: "/login",
//     element: <Login strings={stringsZh} />,
//   },
//   {
//     path: "/register",
//     element: <Register strings={stringsZh} />,
//   },
//   {
//     path: "/notices",
//     element: <Notices strings={stringsZh} />,
//   },
//   {
//     path: "/notices/:notice_id",
//     element: <Notices strings={stringsZh} />,
//   },
//   {
//     path: "/profile",
//     element: <UserProfile strings={stringsZh} />,
//   },
//   {
//     path: "/reservation",
//     element: <Book strings={stringsZh} />,
//   },
//   {
//     path: "/reservation/:room_id",
//     element: <Book strings={stringsZh} />,
//   },
//   {
//     path: "/en",
//     element: <Home strings={stringsEn} />,
//   },
//   {
//     path: "/en/login",
//     element: <Login strings={stringsEn} />,
//   },
//   {
//     path: "/en/register",
//     element: <Register strings={stringsEn} />,
//   },
//   {
//     path: "/en/notices",
//     element: <Notices strings={stringsEn} />,
//   },
//   {
//     path: "/en/notices/:notice_id",
//     element: <Notices strings={stringsEn} />,
//   },
//   {
//     path: "/en/profile",
//     element: <UserProfile strings={stringsEn} />,
//   },
//   {
//     path: "/en/reservation",
//     element: <Book strings={stringsEn} />,
//   },
//   {
//     path: "/en/reservation/:room_id",
//     element: <Book strings={stringsEn} />,
//   },
// ]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
