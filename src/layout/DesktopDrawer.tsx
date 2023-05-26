import * as React from "react";
import { 
    CSSObject, 
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Theme, 
    Toolbar, 
    Typography
} from '@mui/material';

import MuiDrawer from '@mui/material/Drawer';
import styled from '@mui/material/styles/styled';
import { Link } from "utils/Navigate";

const drawerWidth = 180;

interface DrawerProps {
    open: boolean;
    children: React.ReactNode;
}

function Drawer({ open, children }: DrawerProps) {
    return (
        <CustomDrawer
            variant="permanent"
            open={open}
            sx={{
                display: { xs: 'none', sm: 'block' }
            }}
        >
            <Toolbar />
            <List>{children}</List>
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
    icon?: React.ReactElement;
    link: string;
    open: boolean;
    onClick?: () => void;
    selected: boolean;
}

export const DrawerItem = (props: DrawerItemProps) => {
    const { name, icon, link, open, onClick, selected } = props;
    return (
        <ListItem key={name} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={Link} to={link} selected={selected} onClick={onClick}
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

export default Drawer;