import { Box, Button, TextField, Typography } from "@mui/material";
import * as React from "react";

import { useAuth } from "providers/AuthProvider";
import { useSnackbar } from "providers/SnackbarProvider";
import { Link, useNavigate } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { EmailFieldParams, NameFieldParams, PasswordFieldParams, UsernameFieldParams } from "utils/util";

function Register() {
    const [error, setError] = React.useState<Record<string, string>>({});
    let navigate = useNavigate();
    let { logout } = useAuth();
    let { showSnackbar } = useSnackbar();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError({});
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

        fetch(api_paths.register, {
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
                showSnackbar({ message: "注册成功", severity: "success", duration: 2000});
                logout(() => {
                    navigate("/login", { replace: true });
                });
            } else if (res.status === 409) {
                setError({ username: "用户名已存在" });
            } else {
                throw new Error();
            }
        })
        .catch((err) => {
            setError({ register: "注册失败" });
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
                注册
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
                <TextField {...UsernameFieldParams}
                    autoFocus
                    label="用户名"
                    error={'username' in error}
                    helperText={error.username}
                />
                <TextField {...PasswordFieldParams}
                    label="密码"
                    error={'password' in error}
                />
                <TextField {...PasswordFieldParams}
                    id="confirmPassword" 
                    label="确认密码"
                    name="confirmPassword"
                    error={'password' in error}
                    helperText={error.password}
                />
                <TextField {...NameFieldParams} 
                    label="姓名"
                />
                <TextField {...EmailFieldParams} 
                    label="邮箱"
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    注册
                </Button>
                <Box display="flex">
                    <Typography variant="body2" component="p" gutterBottom
                        margin="auto"
                    >
                        已有账号？
                        <Link to="/login" >登录</Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default Register;