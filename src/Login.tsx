import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function Login() {
    const [errorMessge, setErrorMessge] = React.useState("");
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('username');
        const password = data.get('password');

        fetch("/api/login", {
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
                    const token = data.get("token");
                    localStorage.setItem("token", token);
                    //TODO: redirect to home page
                });
            } else {
                setErrorMessge("用户名或密码错误");
            }
        })
        .catch((err) => {
            // console.log(err);
            setErrorMessge("登录失败");
        });
    };

    return (
        <Box 
            sx={{ 
                width: "100%", height: "65vh", 
                display: "flex", flexDirection: 'column', 
                justifyContent: "center", alignItems: "center"
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                用户登录
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                    variant='standard'
                    required
                    fullWidth
                    id="username"
                    label="用户名"
                    name="username"
                    autoFocus
                    error={errorMessge !== ""}
                />
                <TextField
                    variant='standard'
                    required
                    fullWidth
                    id="password"
                    label="密码"
                    name="password"
                    type="password"
                    error={errorMessge !== ""}
                    helperText={errorMessge}
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    登录
                </Button>
                <Box display="flex">
                    <Typography variant="body2" component="p" gutterBottom
                        margin="auto"
                    >
                        没有账号？<a href="/register">注册</a>
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default Login;