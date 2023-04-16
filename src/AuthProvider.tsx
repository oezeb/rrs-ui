import * as React from "react";
import {
  Link,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { email_regex } from "./util";

export interface AuthContextProps {
    user: Record<string, any> | null;
    update: (callback: (res: Response) => void) => void; // update user info
    login: (username: string, password: string, callback: (res: Response) => void) => void;
    logout: (callback: (res: Response) => void) => void;
}

const AuthContext = React.createContext<AuthContextProps>(null!);

function AuthProvider(props: React.PropsWithChildren<{}>) {
    const [user, setUser] = React.useState<Record<string, any> | null>(null);

    const update = async (callback: (res: Response) => void) => {
        let res = await fetch("/api/user");
        if (res.ok) {
            let user = await res.json();
            setUser(user);
        } else {
            setUser(null);
        }
        callback(res);
    };
    
    const login = async (username: string, password: string, callback: (res: Response) => void) => {
        let res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${btoa(`${username}:${password}`)}`,
            },
        });

        if (res.ok) {
            update(callback);
        } else {
            callback(res);
        }
    };

    const logout = async (callback: (res: Response) => void) => {
        let res = await fetch("/api/logout", { method: "POST" });
        if (res.ok) {
            setUser(null);
        }
        callback(res);
    };

    React.useEffect(() => {
        update(() => {});
    }, []);

    return (
        <AuthContext.Provider value={{ user, update, login, logout }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const [loading, setLoading] = React.useState(true);
    const auth = React.useContext(AuthContext);

    React.useEffect(() => {
        if (auth.user) {
            setLoading(false);
        } else {
            auth.update((res) => {
                setLoading(false);
            });
        }
    }, [auth]);

    return { ...auth, loading };
}

export function RequireAuth({ children }: { children: React.ReactNode}) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        );
    } else if (user) {
        return <>{children}</>;
    } else {
        return <Navigate 
            to="/login"
            state={{ from: location }}
            replace
        />;
    }
}

export function Login() {
    const [error, setError] = React.useState(false);
    let navigate = useNavigate();
    let location = useLocation();
    let auth = useAuth();
  
    let from = location.state?.from?.pathname || "/";
  
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
                <TextField
                    variant='standard'
                    required
                    fullWidth
                    id="username"
                    label="用户名"
                    name="username"
                    autoFocus
                    error={error}
                />
                <TextField
                    variant='standard'
                    required
                    fullWidth
                    id="password"
                    label="密码"
                    name="password"
                    type="password"
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

export function Register() {
    const [error, setError] = React.useState<Record<string, string>>({});
    let navigate = useNavigate();
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
                navigate("/login", { replace: true });
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
                <TextField
                    variant='standard'
                    required
                    fullWidth
                    id="username"
                    label="用户名"
                    name="username"
                    autoFocus
                    error={'username' in error}
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
                    error={'password' in error}
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
                    error={'password' in error}
                    helperText={error.password}
                    inputProps={{ minLength: 6, maxLength: 20 }}
                />
                <TextField
                    variant='standard'
                    required
                    fullWidth
                    id="name"
                    label="姓名"
                    name="name"
                    inputProps={{ minLength: 1 }}
                />
                <TextField
                    variant='standard'
                    fullWidth
                    id="email"
                    label="邮箱"
                    name="email"
                    type="email"
                    inputProps={{ pattern: email_regex }}
                />
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

export default AuthProvider;