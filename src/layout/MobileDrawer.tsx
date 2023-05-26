import * as React from "react";
import { 
    Drawer as MuiDrawer,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Toolbar, 
    useMediaQuery, useTheme 
} from '@mui/material';
import { Link } from "utils/Navigate";

const drawerWidth = 180;

interface Props {
    window?: () => Window;
    toggleDrawer: () => void;
    open: boolean;
    children: React.ReactNode;
  }

function Drawer(props: Props) {
    const { window, toggleDrawer, open, children } = props;
    const theme = useTheme();
    const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <MuiDrawer container={container} variant="temporary" open={is_mobile ? !open : false}
            onClose={toggleDrawer}
            ModalProps={{ keepMounted: true }}
            sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
        ><Toolbar />
            <List>{children}</List>
        </MuiDrawer>
    );
}

interface DrawerItemProps {
    name: string;
    icon?: React.ReactElement;
    link: string;
    onClick?: () => void;
    selected: boolean;
}

export const DrawerItem = (props: DrawerItemProps) => {
    const { name, icon, link, onClick, selected } = props;
    return (
        <ListItem key={name} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={Link} to={link} onClick={onClick} selected={selected}>
                <ListItemIcon>
                    {icon}
                </ListItemIcon>
                <ListItemText primary={name} />
            </ListItemButton>
        </ListItem>
    );
}

export default Drawer;