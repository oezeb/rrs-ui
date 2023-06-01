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
        {name: strings.zh["reservations"], link: "/reservations/add", icon: <EventAvailableIcon />},
        {name: strings.zh["notices"], link: "/notices", icon: <NotificationsIcon />},
        {name: strings.zh["about"], link: "/about", icon: <InfoIcon />},
    ] as const;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar toggleDrawer={toggleDrawer} showToAdmin={true} title={strings.zh["title"]} />
            <DesktopDrawer open={open} >
                {drawer_items.map((item, index) => {
                    if (item.name === strings.zh["reservations"] && !user) return null;
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
                    if (item.name === strings.zh["reservations"] && !user) return null;
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

const strings = {
    "zh": {
        "title": "预约系统",
        "reservations": "预约",
        "notices": "通知",
        "about": "关于",
    } as const,
} as const;

export default Layout;