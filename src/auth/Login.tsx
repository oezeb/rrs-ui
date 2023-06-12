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

function Login() {
    const [error, setError] = React.useState(false);
    let navigate = useNavigate();
    let location = useLocation();
    const auth = useAuth();
    let { showSnackbar } = useSnackbar();
  
    let from = location.state?.from || "/";
    console.log(from);

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
                登录
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField {...UsernameFieldParams}
                    label="用户名"
                    error={error}
                    autoFocus
                />
                <TextField {...PasswordFieldParams}
                    label="密码"
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
                        没有账号？
                        <Link to="/register" >
                            注册
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default Login;