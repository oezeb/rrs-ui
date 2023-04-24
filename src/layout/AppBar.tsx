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
import { Link, useNavigate } from '../Navigate';

interface Props {
    title: string;
    onTitleClick?: () => void;
    toggleDrawer?: () => void;
    showMenuButton?: boolean;
    showToAdmin?: boolean,
    showToUser?: boolean,
}

function AppBar({ title, onTitleClick, toggleDrawer, showMenuButton, showToAdmin, showToUser }: Props) {
    const { user, logout } = useAuth();
    let navigate = useNavigate();

    const handleLogout = () => {
        logout(() => navigate(""));
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
                <Button onClick={onTitleClick} variant='text' color='inherit' component={Link} to="" sx={{ textTransform: 'none'}}>
                    <Typography variant="h6" noWrap component="div">
                        {title}
                    </Typography>
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <LangMenu />
                {user ? <UserMenu  user={user} logout={handleLogout} showToAdmin={showToAdmin} showToUser={showToUser} /> : <>
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