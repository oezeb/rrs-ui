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
import AppBar from "./layout/AppBar";
import About from "./About";
import Rooms from "./rooms/Rooms";
import RoomDetails from "./rooms/RoomDetails";
import { PeriodsProvider } from "./PeriodsProvider";

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
                        path="/rooms"
                        element={<Rooms />}
                    />
                    <Route
                        path="/rooms/:room_id"
                        element={<RoomDetails />}
                    />
                    <Route 
                        path="/notices" 
                        element={<Notices />} 
                    />
                    <Route
                        path="/about"
                        element={<About />}
                    />
                    <Route 
                        path="/profile"
                        element={<RequireAuth><Profile /></RequireAuth>} 
                    />
                    <Route 
                        path="/reservations" 
                        element={<RequireAuth><Resvs /></RequireAuth>} 
                    />
                    <Route 
                        path="/reservations/new" 
                        element={<RequireAuth><PeriodsProvider><NewResv /></PeriodsProvider></RequireAuth>} 
                    />
                </Route>

                <Route 
                    path="/login" 
                    element={<><AppBar showMenuButton={false} /><Login /></>} 
                />
                <Route 
                    path="/register" 
                    element={<><AppBar showMenuButton={false} /><Register /></>} 
                />
            </Routes>
        </SnackbarProvider>
    </AuthProvider>
  )
}

export default App;
