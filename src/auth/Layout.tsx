import AppBar from "layout/AppBar";
import { Outlet } from "react-router-dom";

const Layout = () =>  (
    <div>
        <AppBar title="预约系统" showMenuButton={false} />
        <Outlet />
    </div>
);

export default Layout;