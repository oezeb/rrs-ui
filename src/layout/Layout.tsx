import * as React from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline, Toolbar } from '@mui/material';

import InfoIcon from '@mui/icons-material/Info';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import { useLocation } from "react-router-dom";

import AppBar from "./AppBar";
import DesktopDrawer, { DrawerItem as DesktopDrawerItem } from "./DesktopDrawer";
import MobileDrawer, { DrawerItem as MobileDrawerItem } from "./MobileDrawer";
import { useAuth } from "providers/AuthProvider";

function Layout() {
    const [open, setOpen] = React.useState(true);
    const location = useLocation();
    const { user } = useAuth();

    const toggleDrawer = () => {
        setOpen(oldOpen => !oldOpen);
    };

    const mobileOnClick = () => {
        setTimeout(() => { toggleDrawer();});
    };
    
    const drawer_items = [
        { name: "预约", link: "/reservations/add", icon: <EventAvailableIcon /> },
        { name: "通知", link: "/notices", icon: <NotificationsIcon /> },
        { name: "关于", link: "/about", icon: <InfoIcon /> },
    ] as const;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar toggleDrawer={toggleDrawer} showToAdmin={true} title="预约系统" />
            <DesktopDrawer open={open} >
                {drawer_items.map((item, index) => {
                    if (item.name === "预约" && !user) return null;
                    return (
                        <DesktopDrawerItem key={index} name={item.name} 
                            link={item.link} 
                            open={open} 
                            icon={item.icon}
                            selected={location.pathname.startsWith(item.link)}
                        />
                    );
                })}
            </DesktopDrawer>
            <MobileDrawer toggleDrawer={toggleDrawer} open={open} >
                {drawer_items.map((item, index) => {
                    if (item.name === "预约" && !user) return null;
                    return (
                        <MobileDrawerItem key={index} name={item.name} 
                            link={item.link} 
                            icon={item.icon}
                            onClick={mobileOnClick}
                            selected={location.pathname.startsWith(item.link)}
                        />
                    );
                })}
            </MobileDrawer>
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Toolbar />
                <Box sx={{ p: 3, maxWidth: 700, margin: "auto" }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}

export default Layout;