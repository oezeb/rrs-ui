import * as React from "react";
import {
  Outlet,
} from "react-router-dom";
import { Box, CssBaseline, Toolbar } from '@mui/material';

import AppBar from "./AppBar";
import DesktopDrawer from "./DesktopDrawer";
import MobileDrawer from "./MobileDrawer";

function Layout() {
    const [open, setOpen] = React.useState(true);

    const toggleDrawer = () => {
        setOpen(oldOpen => !oldOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar toggleDrawer={toggleDrawer} />
            <DesktopDrawer open={open} />
            <MobileDrawer toggleDrawer={toggleDrawer} open={open} />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Toolbar />
                <Box sx={{ p: 3 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}

export default Layout;