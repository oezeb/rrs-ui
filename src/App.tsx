import { Route, Routes } from "react-router-dom";

import About from "About";

import AdminLayout from "admin/Layout";
import adminRoutes from "admin/Routes";
import AuthLayout from "auth/Layout";
import Login from "auth/Login";
import Register from "auth/Register";
import Home from "home/Home";
import Layout from "layout/Layout";
import Notices from "notices/Notices";
import AuthProvider, { RequireAuth } from "providers/AuthProvider";
import PeriodsProvider from "providers/PeriodsProvider";
import SnackbarProvider from "providers/SnackbarProvider";
import Rooms from "rooms/Rooms";
import Profile from "Profile";
import AddReservation from "reservations/add/AddReservation";
import Reservations from "reservations/Reservations";
import Advanced from "reservations/add/advanced/AddReservation";
import { user_role } from "utils/api";

function App() {
    const adminLayout = <RequireAuth role={user_role.admin}>
        <AdminLayout />
    </RequireAuth>;

    const profile = <RequireAuth role={user_role.restricted}>
        <Profile />
    </RequireAuth>;

    const reservations = <RequireAuth role={user_role.restricted}>
        <Reservations />
    </RequireAuth>;

    const addReservation = <RequireAuth role={user_role.guest}>
        <AddReservation />
    </RequireAuth>;

    const advanced = <RequireAuth role={user_role.basic}>
        <Advanced />
    </RequireAuth>;

    return (
        <AuthProvider><SnackbarProvider><PeriodsProvider>
            <Routes>
                <Route path="/admin" element={adminLayout}>
                    {adminRoutes.map((route, i) => <Route key={i} {...route.props} />)}
                </Route>

                <Route path="/login" element={<AuthLayout />} >
                    <Route index element={<Login />} />
                </Route>
                <Route path="/register" element={<AuthLayout />} >
                    <Route index element={<Register />} />
                </Route>

                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />,
                    <Route path="about" element={<About />} />,
                    <Route path="notices/:notice_id?" element={<Notices />} />,
                    <Route path="rooms/:room_id?" element={<Rooms />} />,
                    
                    <Route path="profile" element={profile} />,
                    <Route path="reservations/:resv_id?" element={reservations} />,
                    <Route path="reservations/add/:room_id?" element={addReservation} />,
                    <Route path="reservations/add/advanced/:room_id?" element={advanced} />, 
                </Route>
            </Routes>
        </PeriodsProvider></SnackbarProvider></AuthProvider>
    );
};

export default App;
