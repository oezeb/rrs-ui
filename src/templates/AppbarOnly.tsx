import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import LanguageIcon from '@mui/icons-material/Language';
import AppBar  from '@mui/material/AppBar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { NavigateFunction } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography/Typography';

import { Dict } from '../types';

interface Props {
    mainView: React.ReactNode;
    strings: Dict;
    links: Dict;
}

const LangMenu = (props: { navigate: NavigateFunction, strings: Dict, links: Dict }) => {
    const { navigate, strings, links } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton 
                onClick={handleClick} 
                color="inherit"
                sx={{display: { xs: 'block', sm: 'none' }}}
            ><LanguageIcon /></IconButton>
            <Button 
                onClick={handleClick}
                color="inherit"
                startIcon={<LanguageIcon />}
                endIcon={open ? <ExpandLess /> : <ExpandMore />}
                sx={{
                    display: { xs: 'none', sm: 'flex' }
                }}
            >{strings.chooseLanguage}</Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={() => {
                    handleClose();
                    navigate(links.chineseVersion)
                }}
                >
                {strings.chineseVersion}
                </MenuItem>
                <MenuItem onClick={() => {
                    handleClose();
                    navigate(links.englishVersion)
                }}>
                    {strings.englishVersion}
                </MenuItem>
            </Menu>

        </div>
    )
}


function Template(props: Props) {
    const { mainView, strings, links } = props;
    const navigate = useNavigate();

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar>
                    <Button variant='text' color='inherit'
                        onClick={() => navigate(links.home)}
                        sx={{ textTransform: 'none'}}
                    >
                        <Typography variant="h6" noWrap component="div">
                            {strings.title}
                        </Typography>
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <LangMenu 
                        navigate={navigate} 
                        strings={strings} 
                        links={links} 
                    />
                </Toolbar>
            </AppBar>
            <Box 
                component="main"
                sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {mainView}
            </Box>
        </Box>
    );
}

export default Template;
