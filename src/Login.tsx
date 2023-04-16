import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import Template from './templates/AppbarOnly';
import { Dict } from './types';
import { links as get_links } from "./util";

function Login({ strings }: { strings: Dict }) {
    const links = get_links(strings.lang_code, "/login");
    const [errorMessge, setErrorMessge] = React.useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('username');
        const password = data.get('password');

        const url = "/api/login";
        fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${btoa(`${username}:${password}`)}`,
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    navigate(location.state?.from || links.home);
                } else if (res.status === 401) {
                    setErrorMessge(strings.invalidUsernameOrPassword);
                } else {
                    setErrorMessge(strings.loginFailed);
                }
            })
            
    };

    return (
        <Template
            strings={strings}
            links={links}
            mainView={
        <Box 
            sx={{ 
                width: "100%", height: "65vh", 
                display: "flex", flexDirection: 'column', 
                justifyContent: "center", alignItems: "center"
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                {strings.loginTitle}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                    variant='standard'
                    required
                    fullWidth
                    id="username"
                    label={strings.username}
                    name="username"
                    autoFocus
                    error={errorMessge !== ""}
                />
                <TextField
                    variant='standard'
                    required
                    fullWidth
                    id="password"
                    label={strings.password}
                    name="password"
                    type="password"
                    error={errorMessge !== ""}
                    helperText={errorMessge}
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    {strings.login}
                </Button>
                <Box display="flex">
                    <Typography variant="body2" component="p" gutterBottom
                        margin="auto"
                    >
                        {strings.noAccount}？<Link to={links.register}>{strings.register}</Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
        }
        />
    )
}

export default Login;