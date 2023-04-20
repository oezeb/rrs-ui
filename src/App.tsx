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
import Reservations from "./resvs/Resvs";
import SnackbarProvider from "./SnackbarProvider";
import Layout from "./layout/Layout";
import AppBar from "./layout/AppBar";
import About from "./About";

function App() {
  return(
    <AuthProvider>
        <SnackbarProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route 
                        index 
                        element={<Home />} 
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
                        element={<RequireAuth><Reservations /></RequireAuth>} 
                    />
                    <Route 
                        path="/reservations/new" 
                        element={<RequireAuth><NewResv /></RequireAuth>} 
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
