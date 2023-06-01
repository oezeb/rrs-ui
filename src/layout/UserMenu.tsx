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

interface UserMenuProps {
    user: Record<string, any>,
    logout: () => void,
    showToAdmin?: boolean,
    showToUser?: boolean,
}

const UserMenu = ({ user, logout, showToAdmin, showToUser }: UserMenuProps) => {
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
                {user.role >= user_role.admin && showToAdmin &&
                <MenuItem component={Link} to="/admin" onClick={handleClose}>
                    <AdminPanelSettingsIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings.zh["adminPanel"]}
                    </Typography>
                </MenuItem>}
                {showToUser &&
                <MenuItem component={Link} to="/" onClick={handleClose}>
                    <PersonIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings.zh["userPanel"]}
                    </Typography>
                </MenuItem>}
                <MenuItem component={Link} to="/reservations" onClick={handleClose}>
                    <EventAvailableIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings.zh["reservations"]}
                    </Typography>
                </MenuItem>
                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                    <InfoIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings.zh["profile"]}
                    </Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); logout(); }}>
                    <LogoutIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {strings.zh["logout"]}
                    </Typography>
                </MenuItem>
            </Menu>
        </div>
    );
}

const strings = {
    zh: {
        adminPanel: "管理界面",
        userPanel: "预约界面",
        reservations: "预约记录",
        profile: "个人信息",
        logout: "退出登录"
    } as const
};

export default UserMenu;