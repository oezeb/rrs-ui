import AppBar from "layout/AppBar";
import { Outlet } from "react-router-dom";

function Layout() {
    return (
        <div>
            <AppBar title={strings.zh["title"]} showMenuButton={false} />
            <Outlet />
        </div>
    );
}

const strings = {
    zh: {
        title: "预约系统",
    } as const,
} as const;

export default Layout;