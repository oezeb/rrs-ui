import * as React from "react";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Forbidden from "../Forbidden";
import { Navigate } from "../Navigate";

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

export function RequireAuth({ children, role }: { children: React.ReactNode, role?: number }) {
    const { user, loading } = useAuth();

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
        return role !== undefined && user.role < role ? <Forbidden /> : <>{children}</>;
    } else {
        return <Navigate to="/login" replace />;
    }
}

export default AuthProvider;