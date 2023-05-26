import React from "react";
import {
    Route,
    Routes,
} from "react-router-dom";

import About from "About";
import Login from "auth/Login";
import Register from "auth/Register";

import Home from "home/Home";
import NoticeDetails from "notices/NoticeDetails";
import Notices from "notices/Notices";
import AuthProvider, { RequireAuth } from "providers/AuthProvider";
import { PeriodsProvider } from "providers/PeriodsProvider";
import SnackbarProvider from "providers/SnackbarProvider";
import RoomDetails from "rooms/RoomDetails";
import Rooms from "rooms/Rooms";
import Profile from "user/Profile";
import AddReservation from "user/reservation/AddReservation";
import Resvervations from "user/reservation/Reservations";
import SelectRoom from "user/reservation/SelectRoom";
import Advanced from "user/reservation/advanced/AddReservation";

import Layout from "layout/Layout";
import AdminLayout from "admin/Layout";
import AuthLayout from "auth/Layout";

import { routes as admin_routes } from "admin/Routes";
import { LangProvider } from "providers/LangProvider";

import ResvDetails from "user/reservation/ResvDetails";

function App() {
    const routes = [
        <Route index element={<Home />} />,
        <Route path="rooms" element={<Rooms />} />,
        <Route path="rooms/:room_id" element={<RoomDetails />} />,
        <Route path="notices" element={<Notices />} />,
        <Route path="notices/:notice_id" element={<NoticeDetails />} />,
        <Route path="about" element={<About />} />,
        <Route path="profile" element={<RequireAuth role={-1} ><Profile /></RequireAuth>} />,
        <Route path="reservations" element={<RequireAuth role={-1} ><Resvervations /></RequireAuth>} />,
        <Route path="reservations/:resv_id" element={<RequireAuth role={-1} ><ResvDetails /></RequireAuth>} />,
        <Route path="reservations/add" element={<RequireAuth role={0} ><SelectRoom /></RequireAuth>} />,
        <Route path="reservations/add/:room_id" element={<RequireAuth role={0} ><AddReservation /></RequireAuth>} />,
        <Route path="reservations/add/advanced/:room_id" element={<RequireAuth role={1} ><Advanced /></RequireAuth>} />,
    ];

    return(
        <LangProvider><AuthProvider><SnackbarProvider><PeriodsProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {routes}
                    <Route path="en">{routes}</Route>
                </Route>
                <Route path="/admin" element={<RequireAuth role={3}><AdminLayout /></RequireAuth>}>
                    {admin_routes}
                </Route>
                <Route path="/login" element={<AuthLayout />} >
                    <Route index element={<Login />} />
                </Route>
                <Route path="/register" element={<AuthLayout />} >
                    <Route index element={<Register />} />
                </Route>
            </Routes>
        </PeriodsProvider></SnackbarProvider></AuthProvider></LangProvider>
    )
}

export default App;
