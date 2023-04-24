import {
  Routes,
  Route,
} from "react-router-dom";

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
import Advanced from "./resvs/Advanced";
import AppBar from "./layout/AppBar";

import AdminLayout from "./admin/Layout";
import AdminResvs from "./admin/Resvs";
import AdminUsers from "./admin/Users";
import AdminRooms from "./admin/rooms/Rooms";
import AdminSessions from "./admin/Sessions";
import AdminPeriods from "./admin/Periods";
import AdminNotices from "./admin/Notices";
import AdminSettings from "./admin/Settings";
import AdminLanguages from "./admin/Languages";
import AdminAddRoom from "./admin/rooms/AddRom";
import AdminEditRoom from "./admin/rooms/EditRoom";
import AdminRoomTypes from "./admin/rooms/types/Types";
import AdminRoomStatus from "./admin/rooms/status/Status";
import AdminAddRoomType from "./admin/rooms/types/AddType";
import AdminEditRoomType from "./admin/rooms/types/EditType";
import AdminEditRoomStatus from "./admin/rooms/status/EditStatus";

function App() {
  return(
    <AuthProvider>
        <SnackbarProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route 
                        index 
                        element={<PeriodsProvider><Home /></PeriodsProvider>} 
                    />
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
                    <Route path="reservations" element={<AdminResvs />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="rooms" element={<AdminRooms />} />
                    <Route path="rooms/add" element={<AdminAddRoom />} />
                    <Route path="rooms/edit" element={<AdminEditRoom />} />
                    <Route path="rooms/types" element={<AdminRoomTypes />} />
                    <Route path="rooms/status" element={<AdminRoomStatus />} />
                    <Route path="rooms/status/edit" element={<AdminEditRoomStatus />} />
                    <Route path="rooms/types/add" element={<AdminAddRoomType />} />
                    <Route path="rooms/types/edit" element={<AdminEditRoomType />} />
                    <Route path="sessions" element={<AdminSessions />} />
                    <Route path="periods" element={<AdminPeriods />} />
                    <Route path="notices" element={<AdminNotices />} />
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
            </Routes>
        </SnackbarProvider>
    </AuthProvider>
  )
}

export default App;
