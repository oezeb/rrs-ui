import * as React from "react";
import { Navigate } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import BackDrop from "utils/BackDrop";
import Forbidden from "utils/Forbidden";

export interface AuthContextProps {
    user: Record<string, any>|null|undefined;
    update: (callback?: (res: Response) => void) => void; // update user info
    login: (username: string, password: string, callback?: (res: Response) => void) => void;
    logout: (callback?: (res: Response) => void) => void;
}

const AuthContext = React.createContext<AuthContextProps>(null!);

function AuthProvider(props: React.PropsWithChildren<{}>) {
    const [user, setUser] = React.useState<Record<string, any>|null|undefined>(undefined);

    const update = async (callback?: (res: Response) => void) => {
        try {
            let res = await fetch(api_paths.user);
            if (!res.ok) throw new Error(res.statusText);
            let user = await res.json();
            setUser(user);

            if (callback) {
                callback(res);
            }
        } catch (err) {
            console.error(err);
            setUser(null);
        }
    };
    
    const login = async (username: string, password: string, callback?: (res: Response) => void) => {
        try {
            let res = await fetch(api_paths.login, {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${btoa(`${username}:${password}`)}`,
                },
            });

            if (res.ok) {
                update(callback);
            } else if (callback) {
                callback(res);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const logout = async (callback?: (res: Response) => void) => {
        let res = await fetch(api_paths.logout, { method: "POST" });
        if (res.ok) {
            setUser(null);
        }

        if (callback) {
            callback(res);
        }
    };

    React.useEffect(() => {
        if (user !== undefined) return;
        update();
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, update, login, logout }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const auth = React.useContext(AuthContext);

    React.useEffect(() => {
        if (auth.user !== undefined) return;
        auth.update();
    }, [auth]);

    return { ...auth };
}

export function RequireAuth({ children, role }: { children: React.ReactNode, role?: number }) {
    const { user } = useAuth();

    if (user === undefined) {
        return <BackDrop open />;
    } else if (user === null) {
        return <Navigate to="/login" />;
    } else if (role !== undefined && user.role < role) {
        return <Forbidden />;
    } else {
        return <>{children}</>;
    }
}

export default AuthProvider;