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
import { UserRole } from "../util";
import { Link } from "../Navigate";

const UserMenu = (props: { 
    user: Record<string, any>, 
    logout: () => void,
    showToAdmin?: boolean,
    showToUser?: boolean,
}) => {
    const { user, logout, showToAdmin, showToUser } = props;
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => { setAnchorEl(null); };

    return (
        <div>
            <Tooltip title="个人信息">
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
                {user.role >= UserRole.admin && showToAdmin &&
                <MenuItem component={Link} to="/admin" onClick={handleClose}>
                    <AdminPanelSettingsIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        管理界面
                    </Typography>
                </MenuItem>}
                {/* User panel */}
                {showToUser &&
                <MenuItem component={Link} to="/" onClick={handleClose}>
                    <PersonIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        预约界面
                    </Typography>
                </MenuItem>}
                <MenuItem component={Link} to="/reservations" onClick={handleClose}>
                    <EventAvailableIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        预约记录
                    </Typography>
                </MenuItem>
                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                    <InfoIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        个人信息
                    </Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); logout(); }}>
                    <LogoutIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        退出登录
                    </Typography>
                </MenuItem>
            </Menu>
        </div>
    );
}

export default UserMenu;