import * as React from "react";
import { Button, IconButton, Tooltip } from '@mui/material';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from "../Navigate";
import { useLang } from "../LangProvider";
// import { useLocation } from "react-router-dom";

const LangMenu = () => {
    const lang = useLang();
    // const location = useLocation();
    
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
            <Tooltip title={strings[lang]["selectLang"]}>
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
                {strings[lang]["selectLang"]}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClose} component={Link} to="/" selected={lang === "zh"}>
                    {strings[lang]["zh"]}
                </MenuItem>
                <MenuItem onClick={handleClose} component={Link} to="/en" selected={lang === "en"}>
                    {strings[lang]["en"]}
                </MenuItem>
            </Menu>
        </div>
    )
}

const strings = {
    "zh": {
        "selectLang": "选择语言",
        "zh": "中文版",
        "en": "English",
    } as const,
    "en": {
        "selectLang": "Language",
        "zh": "中文版",
        "en": "English",
    } as const,
}

export default LangMenu;