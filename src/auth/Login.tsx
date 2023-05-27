import {
    Box,
    Button,
    TextField,
    Typography
} from "@mui/material";
import * as React from "react";
import { useLocation } from "react-router-dom";

import { Link, useNavigate } from "utils/Navigate";
import { useSnackbar } from "providers/SnackbarProvider";
import { useAuth } from "providers/AuthProvider";
import { PasswordFieldParams, UsernameFieldParams } from "utils/util";
import { to, useLang } from "providers/LangProvider";

function Login() {
    const [error, setError] = React.useState(false);
    let navigate = useNavigate();
    let location = useLocation();
    const auth = useAuth();
    const lang = useLang();
    let { showSnackbar } = useSnackbar();
  
    let from = location.state?.from || "";

    React.useEffect(() => {
        if (auth.user) {
            navigate(from, { replace: true });
        }
    }, [auth, from, navigate, showSnackbar]);
  
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(false);
        let data = new FormData(event.currentTarget);
        let username = data.get('username') as string;
        let password = data.get('password') as string;

        auth.login(username, password, (res) => {
            if (res.ok) {
                navigate(from, { replace: true });
            } else {
                setError(true);
            }
        });
    }

    return (
        <Box 
            sx={{ 
                width: "100%", height: "100vh",
                display: "flex", flexDirection: 'column', 
                justifyContent: "center", alignItems: "center"
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                {strings[lang].login}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField {...UsernameFieldParams}
                    label={strings[lang].username}
                    error={error}
                    autoFocus
                />
                <TextField {...PasswordFieldParams}
                    label={strings[lang].password}
                    error={error}
                    helperText={error ? strings[lang].usernameOrPasswordError : ""}
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    {strings[lang].login}
                </Button>
                <Box display="flex">
                    <Typography variant="body2" component="p" gutterBottom
                        margin="auto"
                    >
                        {strings[lang].noAccount}
                        <Link to={to("/register", lang)}>
                            {strings[lang].register}
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

const strings = {
    zh: {
        login: "登录",
        username: "用户名",
        password: "密码",
        usernameOrPasswordError: "用户名或密码错误",
        noAccount: "没有账号？",
        register: "注册",
    } as const,
    en: {
        login: "Login",
        username: "Username",
        password: "Password",
        usernameOrPasswordError: "Username or password error",
        noAccount: "No account?",
        register: "Register",
    } as const,
} as const;

export default Login;