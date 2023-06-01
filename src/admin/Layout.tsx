import { Box, CssBaseline, Toolbar } from '@mui/material';
import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";

import DateRangeIcon from '@mui/icons-material/DateRange';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupIcon from '@mui/icons-material/Group';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelapseIcon from '@mui/icons-material/Timelapse';

import AppBar from "layout/AppBar";
import DesktopDrawer, { DrawerItem as DesktopDrawerItem } from "layout/DesktopDrawer";
import MobileDrawer, { DrawerItem as MobileDrawerItem } from "layout/MobileDrawer";

function Layout() {
    const [open, setOpen] = React.useState(true);
    const location = useLocation();

    const toggleDrawer = () => {
        setOpen(oldOpen => !oldOpen);
    };

    const drawer_items = [
        {name: "预订", link: "reservations", icon: <EventAvailableIcon />},
        {name: "用户", link: "users", icon: <GroupIcon />},
        {name: "房间", link: "rooms", icon: <MeetingRoomIcon />},
        {name: "会话", link: "sessions", icon: <DateRangeIcon />},
        {name: "时段", link: "periods", icon: <TimelapseIcon />},
        {name: "通知", link: "notices", icon: <NotificationsIcon />},
        {name: "设置", link: "settings", icon: <SettingsIcon />},
    ] as const;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar toggleDrawer={toggleDrawer} showToUser title="管理界面" homeLink='/admin' />
            <DesktopDrawer open={open} >
                {drawer_items.map((item, index) => (
                    <DesktopDrawerItem key={index} name={item.name} 
                        link={item.link} 
                        open={open} 
                        icon={item.icon}
                        selected={location.pathname.startsWith(`/admin/${item.link}`)}
                    />
                ))}
            </DesktopDrawer>
            <MobileDrawer toggleDrawer={toggleDrawer} open={open} >
                {drawer_items.map((item, index) => (
                    <MobileDrawerItem key={index} name={item.name} 
                        link={item.link} 
                        icon={item.icon}
                        selected={location.pathname.startsWith(`/admin/${item.link}`)}
                    />
                ))}
            </MobileDrawer>
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Toolbar />
                <Box  sx={{ p: 3, margin: "auto" }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}

export default Layout;