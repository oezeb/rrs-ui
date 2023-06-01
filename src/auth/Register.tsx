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
            setError({ password: strings.zh["passwordNotMatch"] });
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
                showSnackbar({ message: strings.zh["registerSuccess"], severity: "success", duration: 2000});
                logout(() => {
                    navigate("/login", { replace: true });
                });
            } else if (res.status === 409) {
                setError({ username: strings.zh["usernameAlreadyExist"] });
            } else {
                throw new Error();
            }
        })
        .catch((err) => {
            setError({ register: strings.zh["registerFailed"] });
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
                {strings.zh["register"]}
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
                    label={strings.zh["username"]}
                    error={'username' in error}
                    helperText={error.username}
                />
                <TextField {...PasswordFieldParams}
                    label={strings.zh["password"]}
                    error={'password' in error}
                />
                <TextField {...PasswordFieldParams}
                    id="confirmPassword" 
                    label={strings.zh["confirmPassword"]}
                    name="confirmPassword"
                    error={'password' in error}
                    helperText={error.password}
                />
                <TextField {...NameFieldParams} 
                    label={strings.zh["name"]}
                />
                <TextField {...EmailFieldParams} 
                    label={strings.zh["email"]}
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    {strings.zh["register"]}
                </Button>
                <Box display="flex">
                    <Typography variant="body2" component="p" gutterBottom
                        margin="auto"
                    >
                        {strings.zh["alreadyHaveAccount"]}
                        <Link to="/login" >{strings.zh["login"]}</Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

const strings = {
    zh: {
        register: "注册",
        username: "用户名",
        password: "密码",
        confirmPassword: "确认密码",
        name: "姓名",
        email: "邮箱",
        alreadyHaveAccount: "已有账号？",
        login: "登录",
        passwordNotMatch: "两次输入的密码不一致",
        registerFailed: "注册失败",
        registerSuccess: "注册成功",
        usernameAlreadyExist: "用户名已存在",
    } as const,
} as const;

export default Register;