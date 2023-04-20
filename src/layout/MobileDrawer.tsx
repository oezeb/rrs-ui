import * as React from "react";
import {
  Link,
} from "react-router-dom";
import { 
    Drawer, 
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Toolbar, 
    useMediaQuery, useTheme 
} from '@mui/material';

import InfoIcon from '@mui/icons-material/Info';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const drawerWidth = 180;

interface Props {
    window?: () => Window;
    toggleDrawer: () => void;
    open: boolean;
  }

function MobileDrawer(props: Props) {
    const { window, toggleDrawer, open } = props;
    const theme = useTheme();
    const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const container = window !== undefined ? () => window().document.body : undefined;
    const onClick = () => { setTimeout(() => { toggleDrawer();});};

    return (
        <Drawer container={container} variant="temporary" open={is_mobile ? !open : false}
            onClose={toggleDrawer}
            ModalProps={{ keepMounted: true }}
            sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
        ><Toolbar />
            <List>
                <DrawerItem name="预约" onClick={onClick} link="/reservations/new"
                    icon={<EventAvailableIcon />} />
                <DrawerItem  name="通知"  onClick={onClick} link="/notices" 
                    icon={<NotificationsIcon />} />
                <DrawerItem name="关于" onClick={onClick} link="/about"
                    icon={<InfoIcon />} />
            </List>
        </Drawer>
    );
}

interface DrawerItemProps {
    name: string;
    icon: React.ReactElement;
    link: string;
    onClick?: () => void;
}

const DrawerItem = (props: DrawerItemProps) => {
    const { name, icon, link, onClick } = props;
    return (
        <ListItem key={name} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={Link} to={link} onClick={onClick}>
                <ListItemIcon>
                    {icon}
                </ListItemIcon>
                <ListItemText primary={name} />
            </ListItemButton>
        </ListItem>
    );
}

export default MobileDrawer;