import * as React from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline, Toolbar } from '@mui/material';

import InfoIcon from '@mui/icons-material/Info';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import AppBar from "./AppBar";
import DesktopDrawer, { DrawerItem as DesktopDrawerItem } from "./DesktopDrawer";
import MobileDrawer, { DrawerItem as MobileDrawerItem } from "./MobileDrawer";
import { useAuth } from "../auth/AuthProvider";

function Layout() {
    const [open, setOpen] = React.useState(true);
    const [selected, setSelected] = React.useState<string | null>(null);
    const { user } = useAuth();

    const toggleDrawer = () => {
        setOpen(oldOpen => !oldOpen);
    };

    const desktopOnClick = (selected: string) => { 
        setSelected(selected);
    };

    const mobileOnClick = (selected: string) => {
        setSelected(selected);
        setTimeout(() => { toggleDrawer();});
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar toggleDrawer={toggleDrawer} showToAdmin={true} title="预约系统" onTitleClick={() => setSelected(null)}/>
            <DesktopDrawer open={open} >
                {user && 
                <DesktopDrawerItem name="预约" 
                    link="/reservations/new"
                    icon={<EventAvailableIcon />} 
                    open={open} 
                    onClick={() => desktopOnClick("预约")}
                    selected={selected === "预约"}
                />}
                <DesktopDrawerItem name="通知" 
                    link="/notices" 
                    icon={<NotificationsIcon />} 
                    open={open}
                    onClick={() => desktopOnClick("通知")}
                    selected={selected === "通知"}
                />
                <DesktopDrawerItem name="关于" 
                    link="/about" 
                    icon={<InfoIcon />} 
                    open={open} 
                    onClick={() => desktopOnClick("关于")}
                    selected={selected === "关于"}
                />
            </DesktopDrawer>
            <MobileDrawer toggleDrawer={toggleDrawer} open={open} >
                {user && 
                <MobileDrawerItem name="预约" 
                    link="/reservations/new" 
                    icon={<EventAvailableIcon />}
                    onClick={() => mobileOnClick("预约")}
                    selected={selected === "预约"}
                />}
                <MobileDrawerItem name="通知" 
                    link="/notices" 
                    icon={<NotificationsIcon />}
                    onClick={() => mobileOnClick("通知")}
                    selected={selected === "通知"}
                />
                <MobileDrawerItem name="关于" 
                    link="/about" 
                    icon={<InfoIcon />} 
                    onClick={() => mobileOnClick("关于")}
                    selected={selected === "关于"}
                />
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