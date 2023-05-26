import * as React from "react";
import { Button, IconButton, Tooltip, Typography } from '@mui/material';

import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from "utils/Navigate";
import { user_role } from "../utils/api";
import { to, useLang } from "../providers/LangProvider";

interface UserMenuProps {
    user: Record<string, any>,
    logout: () => void,
    showToAdmin?: boolean,
    showToUser?: boolean,
}

const UserMenu = ({ user, logout, showToAdmin, showToUser }: UserMenuProps) => {
    const lang = useLang();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => { setAnchorEl(null); };

    return (
        <div>
            <Tooltip title={user.name}>
                <IconButton onClick={handleClick} color="inherit"
                    sx={{display: { xs: 'block', sm: 'none' }}}
                ><AccountCircleOutlinedIcon /></IconButton>
                </Tooltip>
            <Button onClick={handleClick} color="inherit"
                startIcon={<AccountCircleOutlinedIcon />}
                endIcon={open ? <ExpandLess /> : <ExpandMore />}
                sx={{display: { xs: 'none', sm: 'flex' }}}
            >{user.name}</Button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem divider sx={{ display: { xs: 'flex', sm: 'none' } }}>
                    <PersonIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {user.name}
                    </Typography>
                </MenuItem>
                {/* Admin panel */}
                {user.role >= user_role.admin && showToAdmin &&
                <MenuItem component={Link} to={to("/admin", lang)} onClick={handleClose}>
                    <AdminPanelSettingsIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings[lang]["adminPanel"]}
                    </Typography>
                </MenuItem>}
                {/* User panel */}
                {showToUser &&
                <MenuItem component={Link} to={to("/", lang)} onClick={handleClose}>
                    <PersonIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings[lang]["userPanel"]}
                    </Typography>
                </MenuItem>}
                <MenuItem component={Link} to={to("/reservations", lang)} onClick={handleClose}>
                    <EventAvailableIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings[lang]["reservations"]}
                    </Typography>
                </MenuItem>
                <MenuItem component={Link} to={to("/profile", lang)} onClick={handleClose}>
                    <InfoIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings[lang]["profile"]}
                    </Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); logout(); }}>
                    <LogoutIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings[lang]["logout"]}
                    </Typography>
                </MenuItem>
            </Menu>
        </div>
    );
}

const strings = {
    "zh": {
        adminPanel: "管理界面",
        userPanel: "预约界面",
        reservations: "预约记录",
        profile: "个人信息",
        logout: "退出登录"
    } as const,
    "en": {
        adminPanel: "Admin Panel",
        userPanel: "User Panel",
        reservations: "Reservations",
        profile: "Profile",
        logout: "Logout"
    } as const
};

export default UserMenu;