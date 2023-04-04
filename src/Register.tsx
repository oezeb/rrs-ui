import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link, useNavigate } from "react-router-dom";

import Template from './templates/Auth';
import { Dict } from './types';

export interface RegisterProps {
    strings: Dict;
    /* Required strings:
        *All strings from `/templates/Auth.tsx`
        registerTitle
        registerFailed
        login
        register
        username
        password
        passwordsNotMatch
        usernameAlreadyExists
        confirmPassword
        fullName
        email
        alreadyHaveAccount
    */
    links: Dict;
    /* Required links:
        *All links from `/templates/Auth.tsx`
        home
        login
    */
}

function Register(props: RegisterProps) {
    const { strings, links } = props;
    const [error, setError] = React.useState<{ [key: string]: string }>({});
    const navigate = useNavigate();
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        const password = data.get('password');
        const confirmPassword = data.get('confirmPassword');
        if (password !== confirmPassword) {
            setError({ password: strings.passwordsNotMatch });
            return;
        }
        
        const username = data.get('username');
        const name = data.get('name');
        const email = data.get('email');

        fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
                name: name,
                email: email,
            }),
        })
        .then((res) => {
            if (res.status === 201) {
                setError({});
                navigate(links.home);
            } else if (res.status === 409) {
                setError({ username: strings.usernameAlreadyExists });
            } else {
                setError({ email: strings.registerFailed });
            }
        })
        .catch((err) => {
            // console.log(err);
            setError({ email: strings.registerFailed });
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
                    {strings.registerTitle}
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        width: "100%", maxWidth: 400,
                        display: "flex", flexDirection: 'column',
                        justifyContent: "center", alignItems: "center"
                    }}
                >
                    <TextField
                        variant='standard'
                        required
                        fullWidth
                        id="username"
                        label={strings.username}
                        name="username"
                        autoFocus
                        error={error.username !== undefined}
                        helperText={error.username}
                        inputProps={{ minLength: 6, maxLength: 20, pattern: "[a-zA-Z0-9_]+" }}
                    />
                    <TextField
                        variant='standard'
                        required
                        fullWidth
                        id="password"
                        label={strings.password}
                        name="password"
                        type="password"
                        error={error.password !== undefined}
                        inputProps={{ minLength: 6, maxLength: 20 }}
                    />
                    <TextField
                        variant='standard'
                        required
                        fullWidth
                        id="confirmPassword"
                        label={strings.confirmPassword}
                        name="confirmPassword"
                        type="password"
                        error={error.password !== undefined}
                        helperText={error.password}
                    />
                    <TextField
                        variant='standard'
                        required
                        fullWidth
                        id="name"
                        label={strings.fullName}
                        name="name"
                        error={error.name !== undefined}
                        helperText={error.name}
                        inputProps={{ minLength: 1 }}
                    />
                    <TextField
                        variant='standard'
                        fullWidth
                        id="email"
                        label={strings.email}
                        name="email"
                        error={error.email !== undefined}
                        helperText={error.email}
                    />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        {strings.register}
                    </Button>
                    <Box display="flex">
                        <Typography variant="body2" component="p" gutterBottom
                            margin="auto"
                        >
                            {strings.alreadyHaveAccount}？<Link to={links.login}>{strings.login}</Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        }
        />
    );
}

export default Register;