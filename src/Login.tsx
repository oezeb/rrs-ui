import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

import Template from './templates/Auth';
import { Dict } from './types';

export interface LoginProps {
    strings: Dict;
    /* Required strings:
        *All strings in `/templates/Auth.tsx`
        loginTitle
        loginFailed
        login
        register
        username
        password
        invalidUsernameOrPassword
        noAccount
    */
    links: Dict;
    /* Required links:
        *All links in `/templates/Auth.tsx`
        home
        register
    */
}

function Login(props: LoginProps) {
    const { strings, links } = props;
    const [errorMessge, setErrorMessge] = React.useState("");
    const navigate = useNavigate();
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('username');
        const password = data.get('password');

        fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
        .then((res) => {
            if (res.status === 200) {
                setErrorMessge("");
                res.json().then((data) => {
                    if ("token" in data) {
                        localStorage.setItem("token", data.token);
                        navigate(links.home, { replace: true });
                    } else {
                        setErrorMessge(strings.loginFailed);
                    }
                });
            } else {
                setErrorMessge(strings.invalidUsernameOrPassword);
            }
        })
        .catch((err) => {
            // console.log(err);
            setErrorMessge(strings.loginFailed);
        });
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