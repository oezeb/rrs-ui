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
import { useAuth } from "../providers/AuthProvider";
import { Link, useNavigate } from 'utils/Navigate';
import { to, useLang } from '../providers/LangProvider';

interface Props {
    title: string;
    onTitleClick?: () => void;
    toggleDrawer?: () => void;
    showMenuButton?: boolean;
    showToAdmin?: boolean,
    showToUser?: boolean,
}

function AppBar(props: Props) {
    const { title, onTitleClick, toggleDrawer, showMenuButton, showToAdmin, showToUser } = props;
    const { user, logout } = useAuth();
    let navigate = useNavigate();
    
    const lang = useLang();

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
                <Button onClick={onTitleClick} variant='text' color='inherit' component={Link} to={to("/", lang)}  sx={{ textTransform: 'none'}}>
                    <Typography variant="h6" noWrap component="div">
                        {title}
                    </Typography>
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <LangMenu />
                {user ? <UserMenu  user={user} logout={handleLogout} showToAdmin={showToAdmin} showToUser={showToUser} /> : <>
                    <Tooltip title={strings[lang]["login"]}>
                        <IconButton color="inherit" component={Link} to={to("/login", lang)}
                            sx={{ display: { xs: 'block', sm: 'none' } }}
                        >
                            <AccountCircleOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    <Button color="inherit" component={Link} to={to("/login", lang)}
                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                        startIcon={<AccountCircleOutlinedIcon />}
                    >
                        {strings[lang]["login"]}
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
    "en": {
        "login": "Login",
    } as const
};

export default AppBar;