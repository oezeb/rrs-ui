import { Link, useNavigate } from "react-router-dom";
import { 
    AppBar as MuiAppBar, 
    Box, 
    Button, 
    IconButton, 
    Toolbar, 
    Tooltip, 
    Typography 
} from '@mui/material';

import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuIcon from '@mui/icons-material/Menu';

import LangMenu from "./LangMenu";
import UserMenu from "./UserMenu";
import { useAuth } from "../auth/AuthProvider";

interface Props {
    toggleDrawer?: () => void;
    showMenuButton?: boolean;
}

function AppBar({ toggleDrawer, showMenuButton }: Props) {
    const { user, logout } = useAuth();
    let navigate = useNavigate();

    const handleLogout = () => {
        logout(() => navigate('/'));
    }

    return (
        <MuiAppBar
            position="fixed"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <Toolbar>
                {(showMenuButton || showMenuButton === undefined) &&
                <IconButton color="inherit" onClick={toggleDrawer} sx={{ mr: 2 }}>
                    <MenuIcon />
                </IconButton>}
                <Button variant='text' color='inherit' component={Link} to='/' sx={{ textTransform: 'none'}}>
                    <Typography variant="h6" noWrap component="div">
                        预约系统
                    </Typography>
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <LangMenu />
                {user ? <UserMenu  user={user} logout={handleLogout} /> : <>
                    <Tooltip title="登录">
                        <IconButton color="inherit" component={Link} to="/login"
                            sx={{ display: { xs: 'block', sm: 'none' } }}
                        >
                            <AccountCircleOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    <Button color="inherit" component={Link} to="/login"
                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                        startIcon={<AccountCircleOutlinedIcon />}
                    >
                        登录
                    </Button>
                </>}
            </Toolbar>
        </MuiAppBar>
    )
}

export default AppBar;