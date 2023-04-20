import * as React from "react";
import { Link } from "react-router-dom";
import { Button, IconButton, Tooltip } from '@mui/material';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const LangMenu = () => {
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
                <MenuItem onClick={handleClose} component={Link} to="/">
                    中文版
                </MenuItem>
                <MenuItem onClick={handleClose} component={Link} to="/en">
                    English
                </MenuItem>
            </Menu>
        </div>
    )
}

export default LangMenu;