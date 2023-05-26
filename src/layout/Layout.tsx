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
import { useAuth } from "../providers/AuthProvider";
import { to, useLang } from "../providers/LangProvider";

function Layout() {
    const lang  = useLang();
    const [open, setOpen] = React.useState(true);
    const location = useLocation();
    const { user } = useAuth();

    const toggleDrawer = () => {
        setOpen(oldOpen => !oldOpen);
    };

    const mobileOnClick = () => {
        setTimeout(() => { toggleDrawer();});
    };

    const links = {
        "reservations": to("/reservations/add", lang),
        "notices": to("/notices", lang),
        "about": to("/about", lang),
    } as const;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar toggleDrawer={toggleDrawer} showToAdmin={true} title={strings[lang]["title"]} />
            <DesktopDrawer open={open} >
                {user && 
                <DesktopDrawerItem name={strings[lang]["reservations"]}
                    link={links["reservations"]}
                    icon={<EventAvailableIcon />} 
                    open={open}
                    selected={location.pathname.startsWith(to("/reservations", lang))}
                />}
                <DesktopDrawerItem name={strings[lang]["notices"]}
                    link={links["notices"]}
                    icon={<NotificationsIcon />} 
                    open={open}
                    selected={location.pathname.startsWith(links["notices"])}
                />
                <DesktopDrawerItem name={strings[lang]["about"]}
                    link={links["about"]}
                    icon={<InfoIcon />} 
                    open={open}
                    selected={location.pathname.startsWith(links["about"])}
                />
            </DesktopDrawer>
            <MobileDrawer toggleDrawer={toggleDrawer} open={open} >
                {user && 
                <MobileDrawerItem name={strings[lang]["reservations"]}
                    link={links["reservations"]}
                    icon={<EventAvailableIcon />}
                    onClick={mobileOnClick}
                    selected={location.pathname.startsWith(to("/reservations", lang))}
                />}
                <MobileDrawerItem name={strings[lang]["notices"]}
                    link={links["notices"]}
                    icon={<NotificationsIcon />}
                    onClick={mobileOnClick}
                    selected={location.pathname.startsWith(links["notices"])}
                />
                <MobileDrawerItem name={strings[lang]["about"]}
                    link={links["about"]}
                    icon={<InfoIcon />} 
                    onClick={mobileOnClick}
                    selected={location.pathname.startsWith(links["about"])}
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

const strings = {
    "zh": {
        "title": "预约系统",
        "reservations": "预约",
        "notices": "通知",
        "about": "关于",
    } as const,
    "en": {
        "title": "Reservation System",
        "reservations": "Reservations",
        "notices": "Notices",
        "about": "About",
    } as const,
} as const;

export default Layout;