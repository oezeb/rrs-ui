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

import UserMenu from "./UserMenu";
import { useAuth } from "../providers/AuthProvider";
import { Link, useNavigate } from 'utils/Navigate';

interface Props {
    title: string;
    homeLink?: string;
    toggleDrawer?: () => void;
    showMenuButton?: boolean;
    showToAdmin?: boolean,
    showToUser?: boolean,
}

function AppBar(props: Props) {
    const { title, homeLink, toggleDrawer, showMenuButton, showToAdmin, showToUser } = props;
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
                <Button variant='text' color='inherit' sx={{ textTransform: 'none'}}
                    component={Link} 
                    to={homeLink ? homeLink : "/"}
                >
                    <Typography variant="h6" noWrap component="div">
                        {title}
                    </Typography>
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                {user ? <UserMenu  user={user} logout={handleLogout} showToAdmin={showToAdmin} showToUser={showToUser} /> : <>
                    <Tooltip title={strings.zh["login"]}>
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
                        {strings.zh["login"]}
                    </Button>
                </>}
            </Toolbar>
        </MuiAppBar>
    )
}

const strings = {
    "zh": {
        "login": "登录",
    } as const,
};

export default AppBar;