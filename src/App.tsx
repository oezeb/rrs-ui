import * as React from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AppBar, Box, Button, CSSObject, CssBaseline, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Theme, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';

import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import MuiDrawer from '@mui/material/Drawer';
import styled from '@mui/material/styles/styled';

import AuthProvider, { Login, Register, RequireAuth, useAuth } from "./AuthProvider";
import Home from "./Home";
import Notices from "./Notices";
import Profile from "./Profile";
import Reserve from "./Reserve";
import Reservations from "./Reservations";
import SnackbarProvider from "./SnackbarProvider";

function App() {
  return(
    <AuthProvider>
        <SnackbarProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/notice" element={<Notices />} />
                    <Route path="/notice/:notice_id" element={<Notices />} />
                    <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                    <Route path="/reserve" element={<RequireAuth><Reserve /></RequireAuth>} />
                    <Route path="/reserve/:room_id" element={<RequireAuth><Reserve /></RequireAuth>} />
                    <Route path="/reservations" element={<RequireAuth><Reservations /></RequireAuth>} />
                    <Route path="/reservations/:resv_id" element={<RequireAuth><Reservations /></RequireAuth>} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </SnackbarProvider>
    </AuthProvider>
  )
}

interface Props {
  window?: () => Window;
}

const drawerWidth = 180;

const LangMenu = ({ navigate }: { navigate: (path: string) => void }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Tooltip title="选择语言">
                <IconButton 
                    onClick={handleClick} 
                    color="inherit"
                    sx={{display: { xs: 'block', sm: 'none' }}}
                ><LanguageIcon /></IconButton>
            </Tooltip>
            <Button 
                onClick={handleClick}
                color="inherit"
                startIcon={<LanguageIcon />}
                endIcon={open ? <ExpandLess /> : <ExpandMore />}
                sx={{
                    display: { xs: 'none', sm: 'flex' },
                }}
            >
                选择语言
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={() => {
                    handleClose();
                    navigate("/");
                }}
                >
                    中文版
                </MenuItem>
                <MenuItem onClick={() => {
                    handleClose();
                    navigate("/en");
                }}>
                    English
                </MenuItem>
            </Menu>
        </div>
    )
}

const UserMenu = (props: { 
    user: Record<string, any>, 
    logout: () => void,
    navigate: (path: string) => void,
}) => {
    const { user, logout, navigate } = props;
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Tooltip title="个人信息">
                <IconButton 
                    onClick={handleClick} 
                    color="inherit"
                    sx={{display: { xs: 'block', sm: 'none' }}}
                ><AccountCircleOutlinedIcon /></IconButton>
                </Tooltip>
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
                <MenuItem 
                    onClick={() => {
                        handleClose()
                        navigate("/reservations");
                    }}
                >
                    <EventAvailableIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        预约记录
                    </Typography>
                </MenuItem>
                <MenuItem 
                    onClick={() => {
                        handleClose();
                        navigate("/profile");
                    }}
                >
                    <InfoIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        个人信息
                    </Typography>
                </MenuItem>
                <MenuItem onClick={async () => {
                    handleClose();
                    logout();
                }}>
                    <LogoutIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        退出登录
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

function Layout(props: Props) {
    const { window } = props;
    const { user, logout } = useAuth();
    const [open, setOpen] = React.useState(true);
    const navigate = useNavigate();
    const theme = useTheme();
    const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

    const toggleDrawer = () => {
        setOpen(oldOpen => !oldOpen);
    };

    const container = window !== undefined ? () => window().document.body : undefined;

    const DesktopDrawerItemView = (item: { name: string, icon: React.ReactElement, onClick: () => void }) => {
        return (
            <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                    }}
                    onClick={item.onClick}
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

    const MobileDrawerItemView = (item: { name: string, icon: React.ReactElement, onClick: () => void }) => {
        return (
            <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
                <ListItemButton onClick={item.onClick} >
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
                        onClick={() => navigate('/')}
                        sx={{ textTransform: 'none'}}
                    >
                        <Typography variant="h6" noWrap component="div">
                            预约系统
                        </Typography>
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <LangMenu 
                        navigate={navigate} 

                    />
                    {
                        user ? (
                            <UserMenu  
                                user={user} 
                                logout={() => logout(() => navigate("/") )}
                                navigate={navigate} 
                            />
                        ) : (<>
                            <Tooltip title="登录">
                                <IconButton
                                    color="inherit"
                                    sx={{ display: { xs: 'block', sm: 'none' } }}
                                    onClick={() => navigate("/login")}
                                >
                                    <AccountCircleOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                            <Button 
                                color="inherit" 
                                startIcon={<AccountCircleOutlinedIcon />}
                                sx={{ display: { xs: 'none', sm: 'flex' } }}
                                onClick={() => navigate("/login")}
                            >
                                登录
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
                    { user ? <DesktopDrawerItemView 
                        name="预约" 
                        icon={<EventAvailableIcon />} 
                        onClick={() => {
                            navigate("/reserve");
                        }}
                    /> : null}
                    <DesktopDrawerItemView 
                        name="通知" 
                        icon={<NotificationsIcon/>} 
                        onClick={() => {
                            navigate("/notice");
                        }}
                    />
                    <DesktopDrawerItemView 
                        name="关于"
                        icon={<InfoIcon />}
                        onClick={() => {
                            navigate("/about");
                        }}
                    />
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
                    { user ? <MobileDrawerItemView 
                        name="预约"
                        icon={<EventAvailableIcon />}
                        onClick={() => {
                            navigate("/reserve");
                            setTimeout(() => {
                                toggleDrawer();
                            });
                        }}
                    /> : null}
                    <MobileDrawerItemView 
                        name="通知"
                        icon={<NotificationsIcon />} 
                        onClick={() => {
                            navigate("/notice");
                            setTimeout(() => {
                                toggleDrawer();
                            });
                        }}
                    />
                    <MobileDrawerItemView 
                        name="关于"
                        icon={<InfoIcon />} 
                        onClick={() => {
                            navigate("/about");
                            setTimeout(() => {
                                toggleDrawer();
                            });
                        }}
                    />
                </List>
            </Drawer>
            <Box 
                component="main"
                sx={{ flexGrow: 1 }}
            >
                <Toolbar />
                <Box sx={{ p: 3 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}

export default App;
