import * as React from "react";
import {
  Link,
} from "react-router-dom";
import { 
    CSSObject, 
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Theme, 
    Toolbar, 
    Typography
} from '@mui/material';

import InfoIcon from '@mui/icons-material/Info';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MuiDrawer from '@mui/material/Drawer';
import styled from '@mui/material/styles/styled';
import { useAuth } from "../auth/AuthProvider";

const drawerWidth = 180;

function DesktopDrawer({ open } : { open: boolean }) {
    const { user } = useAuth();
    return (
        <CustomDrawer
            variant="permanent"
            open={open}
            sx={{
                display: { xs: 'none', sm: 'block' }
            }}
        >
            <Toolbar />
            <List>
                {user && <DrawerItem name="预约" link="/reservations/new"
                    icon={<EventAvailableIcon />} open={open} />}
                <DrawerItem name="通知" link="/notices"
                    icon={<NotificationsIcon />} open={open} />
                <DrawerItem name="关于" link="/about"
                    icon={<InfoIcon />} open={open} />
            </List>
        </CustomDrawer>
    );
}

const CustomDrawer = styled(
    MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })
(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
    }),
}));

interface DrawerItemProps {
    name: string;
    icon: React.ReactElement;
    link: string;
    open: boolean;
}

const DrawerItem = (props: DrawerItemProps) => {
    const { name, icon, link, open } = props;
    return (
        <ListItem key={name} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={Link} to={link}
                sx={{
                    minHeight: 48, px: 2.5,
                    justifyContent: open ? 'initial' : 'center',
                }}
            >
                <ListItemIcon
                    sx={{
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        minWidth: 0, mr: open ? 3 : 'auto',
                    }}
                >
                    {icon}
                    <Typography variant="caption" sx={{ display: open ? 'none' : 'block' }}>
                        {name}
                    </Typography>
                </ListItemIcon>
                <ListItemText primary={name} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
        </ListItem>
    );
}
  
const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});
  
const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});
  

export default DesktopDrawer;