import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Outlet, Link } from "react-router-dom";

function Register() {
    const [error, setError] = React.useState<{ [key: string]: string }>({});
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        const password = data.get('password');
        const confirmPassword = data.get('confirmPassword');
        if (password !== confirmPassword) {
            setError({ password: "两次输入的密码不一致" });
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
                // console.log("注册成功");
                setError({});
                //TODO: redirect to Login page
            } else if (res.status === 409) {
                setError({ username: "用户名已存在" });
            } else {
                setError({ email: "注册失败" });
            }
        })
        .catch((err) => {
            // console.log(err);
            setError({ email: "注册失败" });
        });
    };

    return (
        <Box
            sx={{
                width: "100%", height: "100vh",
                display: "flex", flexDirection: 'column',
                justifyContent: "center", alignItems: "center"
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                用户注册
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
                    label="用户名"
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
                    label="密码"
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
                    label="确认密码"
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
                    label="姓名"
                    name="name"
                    error={error.name !== undefined}
                    helperText={error.name}
                    inputProps={{ minLength: 1 }}
                />
                <TextField
                    variant='standard'
                    fullWidth
                    id="email"
                    label="邮箱"
                    name="email"
                    error={error.email !== undefined}
                    helperText={error.email}
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    注册
                </Button>
                <Box display="flex">
                    <Typography variant="body2" component="p" gutterBottom
                        margin="auto"
                    >
                        已有账号？<Link to="/login">登录</Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default Register;