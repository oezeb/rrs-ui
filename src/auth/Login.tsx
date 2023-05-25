import {
    Box,
    Button,
    TextField,
    Typography
} from "@mui/material";
import * as React from "react";
import { useLocation } from "react-router-dom";

import { Link, useNavigate } from "Navigate";
import { useSnackbar } from "SnackbarProvider";
import { useAuth } from "auth/AuthProvider";
import { PasswordFieldParams, UsernameFieldParams } from "auth/Register";

function Login() {
    const [error, setError] = React.useState(false);
    let navigate = useNavigate();
    let location = useLocation();
    let auth = useAuth();
    let { showSnackbar } = useSnackbar();
  
    let from = location.state?.from || "";

    React.useEffect(() => {
        if (auth.user) {
            showSnackbar({ message: "您已登录", severity: "info", duration: 2000})
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
                登录
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField {...UsernameFieldParams}
                    error={error}
                    autoFocus
                />
                <TextField {...PasswordFieldParams}
                    error={error}
                    helperText={error ? "用户名或密码错误" : ""}
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    登录
                </Button>
                <Box display="flex">
                    <Typography variant="body2" component="p" gutterBottom
                        margin="auto"
                    >
                        没有账号？<Link to='/register'>注册</Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default Login;