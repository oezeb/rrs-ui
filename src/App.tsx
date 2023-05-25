import React from "react";
import {
  Routes,
  Route,
} from "react-router-dom";

import MuiBackdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import APIDocs from "./APIDocs";

import AuthProvider, { RequireAuth } from "./auth/AuthProvider";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Home from "./home/Home";
import Notices from "./Notices";
import Profile from "./Profile";
import NewResv from "./resvs/new/NewResv";
import Resvs from "./resvs/Resvs";
import SnackbarProvider from "./SnackbarProvider";
import Layout from "./layout/Layout";
import About from "./About";
import Rooms from "./rooms/Rooms";
import RoomDetails from "./rooms/RoomDetails";
import { PeriodsProvider } from "./PeriodsProvider";
import Advanced from "./resvs/advanced/NewResv";
import AppBar from "./layout/AppBar";

// admin
import AdminLayout from "./admin/Layout";

import AdminReservations from "./admin/reservations/Reservations";
import AdminAddReservation from "./admin/reservations/AddReservation";
import AdminEditReservation from "./admin/reservations/EditReservation";
import AdminResvPrivacy from "./admin/reservations/privacy/Privacy";
import AdminEditPrivacy from "./admin/reservations/privacy/EditPrivacy";
import AdminResvStatus from "./admin/reservations/status/Status";
import AdminEditStatus from "./admin/reservations/status/EditStatus";

import AdminUsers from "./admin/users/Users";
import AdminEditUser from "./admin/users/EditUser";
import AdminAddUser from "./admin/users/AddUser";
import AdminUserRoles from "./admin/users/roles/Roles";
import AdminEditUserRole from "./admin/users/roles/EditRole";

import AdminRooms from "./admin/rooms/Rooms";
import AdminAddRoom from "./admin/rooms/AddRom";
import AdminEditRoom from "./admin/rooms/EditRoom";
import AdminRoomTypes from "./admin/rooms/types/Types";
import AdminRoomStatus from "./admin/rooms/status/Status";
import AdminAddRoomType from "./admin/rooms/types/AddType";
import AdminEditRoomType from "./admin/rooms/types/EditType";
import AdminEditRoomStatus from "./admin/rooms/status/EditStatus";

import AdminSessions from "./admin/sessions/Sessions";
import AdminAddSession from "./admin/sessions/AddSession";
import AdminEditSession from "./admin/sessions/EditSession";

import AdminNotices from "./admin/notices/Notices";
import AdminAddNotice from "./admin/notices/AddNotice";
import AdminEditNotice from "./admin/notices/EditNotice";

import AdminPeriods from "./admin/Periods";

import AdminSettings from "./admin/settings/Settings";

import AdminLanguages from "./admin/languages/Languages";

import { LangProvider } from "./LangProvider";

function App() {
  return(
    <AuthProvider>
        <SnackbarProvider>
            <LangProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route 
                            index 
                            element={<PeriodsProvider><Home /></PeriodsProvider>} 
                        />
                        <Route path="en">
                            <Route
                                index
                                element={<PeriodsProvider><Home /></PeriodsProvider>}
                            />
                            <Route
                                path="profile"
                                element={<RequireAuth><Profile /></RequireAuth>}
                            />
                        </Route>
                        <Route
                            path="rooms"
                            element={<Rooms />}
                        />
                        <Route
                            path="rooms/:room_id"
                            element={<RoomDetails />}
                        />
                        <Route 
                            path="notices" 
                            element={<Notices />} 
                        />
                        <Route
                            path="about"
                            element={<About />}
                        />
                        <Route
                            path="profile"
                            element={<RequireAuth><Profile /></RequireAuth>} 
                        />
                        <Route 
                            path="reservations" 
                            element={<RequireAuth><Resvs /></RequireAuth>} 
                        />
                        <Route 
                            path="reservations/new" 
                            element={<RequireAuth role={0} ><PeriodsProvider><NewResv /></PeriodsProvider></RequireAuth>} 
                        />
                        <Route 
                            path="reservations/advanced"
                            element={<RequireAuth role={1} ><PeriodsProvider><Advanced /></PeriodsProvider></RequireAuth>} 
                        />
                    </Route>
                    <Route path="/admin" element={<RequireAuth role={3}><AdminLayout /></RequireAuth>}>
                        <Route path="reservations" element={<AdminReservations />} />
                        <Route path="reservations/add" element={<PeriodsProvider><AdminAddReservation /></PeriodsProvider>} />
                        <Route path="reservations/edit" element={<AdminEditReservation />} />
                        <Route path="reservations/privacy" element={<AdminResvPrivacy />} />
                        <Route path="reservations/privacy/edit" element={<AdminEditPrivacy />} />
                        <Route path="reservations/status" element={<AdminResvStatus />} />
                        <Route path="reservations/status/edit" element={<AdminEditStatus />} />

                        <Route path="users" element={<AdminUsers />} />
                        <Route path="users/edit" element={<AdminEditUser />} />
                        <Route path="users/add" element={<AdminAddUser />} />
                        <Route path="users/roles" element={<AdminUserRoles />} />
                        <Route path="users/roles/edit" element={<AdminEditUserRole />} />

                        <Route path="rooms" element={<AdminRooms />} />
                        <Route path="rooms/add" element={<AdminAddRoom />} />
                        <Route path="rooms/edit" element={<AdminEditRoom />} />
                        <Route path="rooms/types" element={<AdminRoomTypes />} />
                        <Route path="rooms/status" element={<AdminRoomStatus />} />
                        <Route path="rooms/status/edit" element={<AdminEditRoomStatus />} />
                        <Route path="rooms/types/add" element={<AdminAddRoomType />} />
                        <Route path="rooms/types/edit" element={<AdminEditRoomType />} />

                        <Route path="sessions" element={<AdminSessions />} />
                        <Route path="sessions/add" element={<AdminAddSession />} />
                        <Route path="sessions/edit" element={<AdminEditSession />} />

                        <Route path="notices" element={<AdminNotices />} />
                        <Route path="notices/add" element={<AdminAddNotice />} />
                        <Route path="notices/edit" element={<AdminEditNotice />} />

                        <Route path="periods" element={<AdminPeriods />} />
                        <Route path="settings" element={<AdminSettings />} />

                        <Route path="languages" element={<AdminLanguages />} />
                    </Route>
                    <Route 
                        path="/login" 
                        element={<><AppBar title="预约系统" showMenuButton={false} /><Login /></>} 
                    />
                    <Route 
                        path="/register" 
                        element={<><AppBar title="预约系统" showMenuButton={false} /><Register /></>} 
                    />
                    <Route
                        path="/api-docs"
                        element={<APIDocs />}
                    />
                    {/* <Route
                        path="/redoc"
                        element={<Redoc />}
                    /> */}
                </Routes>
            </LangProvider>
        </SnackbarProvider>
    </AuthProvider>
  )
}


export const BackDrop = ({ open }: { open?: boolean }) => (
    <MuiBackdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open||open===undefined}
    >
    <CircularProgress color="inherit" />
    </MuiBackdrop>
)

export default App;
