import * as React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

import { email_regex } from "../util";
import { useSnackbar } from "../SnackbarProvider";
import { useAuth } from "./AuthProvider";
import { Link, useNavigate } from "../Navigate";
import { paths as api_paths } from "../api";

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
                setError({ register: "注册失败" });
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
                    error={'username' in error}
                    helperText={error.username}
                />
                <TextField {...PasswordFieldParams}
                    error={'password' in error}
                />
                <TextField {...PasswordFieldParams}
                    id="confirmPassword" label="确认密码" name="confirmPassword"
                    error={'password' in error}
                    helperText={error.password}
                />
                <TextField {...NameFieldParams} />
                <TextField {...EmailFieldParams} />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    注册
                </Button>
                <Box display="flex">
                    <Typography variant="body2" component="p" gutterBottom
                        margin="auto"
                    >
                        已有账号？<Link to='/login'>登录</Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}


export const UsernameFieldParams = {
    id: "username",
    label: "用户名",
    name: "username",
    inputProps: { minLength: 1, pattern: "[a-zA-Z0-9_]+" },
    variant: "standard",
    fullWidth: true,
    required: true,
} as const;

export const PasswordFieldParams = {
    id: "password",
    label: "密码",
    name: "password",
    type: "password",
    inputProps: { minLength: 1 },
    variant: "standard",
    fullWidth: true,
    required: true,
} as const;

export const NameFieldParams = {
    id: "name",
    label: "姓名",
    name: "name",
    inputProps: { minLength: 1 },
    variant: "standard",
    fullWidth: true,
    required: true,
} as const;

export const EmailFieldParams = {
    id: "email",
    label: "邮箱",
    name: "email",
    type: "email",
    inputProps: { pattern: email_regex.source },
    variant: "standard",
    fullWidth: true,
} as const;

export default Register;