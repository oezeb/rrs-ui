import React, { useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { Theme, CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import AppBar  from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InfoIcon from '@mui/icons-material/Info';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MuiDrawer from '@mui/material/Drawer';
import styled from '@mui/material/styles/styled';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { NavigateFunction } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { Dict, User } from '../types';

interface Props {
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window?: () => Window;

    user?: User;
    setUser?: (user: User | undefined) => void;
    mainView: React.ReactNode;
    strings: Dict;
    /* Required strings:
        title
        chooseLanguage
        chineseVersion
        englishVersion
        reservations
        makeReservation
        notices
        about
        info
        login
        logout
    */
    links: Dict;
    /* Required links:
        home
        chineseVersion
        englishVersion
        login
    */
}

const drawerWidth = 180;

const LangMenu = (props: { navigate: NavigateFunction, strings: Dict, links: Dict }) => {
    const { navigate, strings, links } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton 
                onClick={handleClick} 
                color="inherit"
                sx={{display: { xs: 'block', sm: 'none' }}}
            ><LanguageIcon /></IconButton>
            <Button 
                onClick={handleClick}
                color="inherit"
                startIcon={<LanguageIcon />}
                endIcon={open ? <ExpandLess /> : <ExpandMore />}
                sx={{
                    display: { xs: 'none', sm: 'flex' },
                }}
            >{strings.chooseLanguage}</Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={() => {
                    handleClose();
                    navigate(links.chineseVersion)
                }}
                >
                {strings.chineseVersion}
                </MenuItem>
                <MenuItem onClick={() => {
                    handleClose();
                    navigate(links.englishVersion)
                }}>
                    {strings.englishVersion}
                </MenuItem>
            </Menu>

        </div>
    )
}

const UserMenu = (props: { 
    user: User, 
    setUser: (user: User | undefined) => void,
    navigate: NavigateFunction, 
    strings: Dict, 
    links: Dict
}) => {
    const { user, setUser, navigate, strings, links } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton 
                onClick={handleClick} 
                color="inherit"
                sx={{display: { xs: 'block', sm: 'none' }}}
            ><AccountCircleOutlinedIcon /></IconButton>
            <Button
                onClick={handleClick}
                color="inherit"
                startIcon={<AccountCircleOutlinedIcon />}
                endIcon={open ? <ExpandLess /> : <ExpandMore />}
                sx={{display: { xs: 'none', sm: 'flex' }}}
            >{user.name}</Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem divider
                    sx={{
                        display: { xs: 'flex', sm: 'none' },
                    }}
                >
                    <PersonIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {user.name}
                    </Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <EventAvailableIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings.reservations}
                    </Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <InfoIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings.info}
                    </Typography>
                </MenuItem>
                <MenuItem onClick={() => {
                    handleClose();
                    localStorage.removeItem('token');
                    setUser(undefined);
                }}>
                    <LogoutIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings.logout}
                    </Typography>
                </MenuItem>
            </Menu>
        </div>
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
  
  const CustomDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
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
    }),
  );
  

function Main(props: Props) {
    const { window, mainView, user, setUser, strings, links } = props;
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();
    const theme = useTheme();
    const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

    const toggleDrawer = () => {
        setOpen(oldOpen => !oldOpen);
    };

    const container = window !== undefined ? () => window().document.body : undefined;

    const DesktopDrawerItemView = (item: { name: string, icon: React.ReactElement }) => {
        return (
            <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                    }}
                >
                    <ListItemIcon
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                        }}
                    >
                        {item.icon}
                        <Typography variant="caption" sx={{ display: open ? 'none' : 'block' }}>
                            {item.name}
                        </Typography>
                    </ListItemIcon>
                    <ListItemText primary={item.name} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
        );
    }

    const MobileDrawerItemView = (item: { name: string, icon: React.ReactElement }) => {
        return (
            <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
                <ListItemButton>
                    <ListItemIcon>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                </ListItemButton>
            </ListItem>
        );
    }

    

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={toggleDrawer}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Button variant='text' color='inherit'
                        onClick={() => navigate(links.home)}
                        sx={{ textTransform: 'none'}}
                    >
                        <Typography variant="h6" noWrap component="div">
                            {strings.title}
                        </Typography>
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <LangMenu 
                        navigate={navigate} 
                        strings={strings} 
                        links={links} 
                    />
                    {
                        user && setUser ? (
                            <UserMenu  
                                user={user} 
                                setUser={setUser}
                                navigate={navigate} 
                                strings={strings}
                                links={links}
                            />
                        ) : (<>
                            <Tooltip title={strings.login}>
                                <IconButton
                                    color="inherit"
                                    sx={{ display: { xs: 'block', sm: 'none' } }}
                                    onClick={() => navigate(links.login)}
                                >
                                    <AccountCircleOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                            <Button 
                                color="inherit" 
                                startIcon={<AccountCircleOutlinedIcon />}
                                sx={{ display: { xs: 'none', sm: 'flex' } }}
                                onClick={() => navigate(links.login)}
                            >
                                {strings.login}
                            </Button>
                        </>)
                    }
                </Toolbar>
            </AppBar>
            <CustomDrawer
                variant="permanent"
                open={open}
                sx={{
                    display: { xs: 'none', sm: 'block' }
                }}
            >
                <Toolbar />
                <List>
                    { user && <DesktopDrawerItemView 
                        name={strings.makeReservation} 
                        icon={<EventAvailableIcon />} 
                    /> }
                    <DesktopDrawerItemView name={strings.notices} icon={<NotificationsIcon />} />
                    <DesktopDrawerItemView name={strings.about} icon={<InfoIcon />} />
                </List>
            </CustomDrawer>
            <Drawer
                container={container}
                variant="temporary"
                open={is_mobile ? !open : false}
                onClose={toggleDrawer}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                >
                <Toolbar />
                <List>
                    { user && <MobileDrawerItemView 
                        name={strings.makeReservation} 
                        icon={<EventAvailableIcon />} /> }
                    <MobileDrawerItemView name={strings.notices} icon={<NotificationsIcon />} />
                    <MobileDrawerItemView name={strings.about} icon={<InfoIcon />} />
                </List>
            </Drawer>
            <Box 
                component="main"
                sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {mainView}
            </Box>
        </Box>
    );
}

export default Main;
