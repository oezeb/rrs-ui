import AppBar from "layout/AppBar";
import { useLang } from "providers/LangProvider";
import { Outlet } from "react-router-dom";

function Layout() {
    const lang = useLang();

    return (
        <div>
            <AppBar title={strings[lang].title} showMenuButton={false} />
            <Outlet />
        </div>
    );
}

const strings = {
    zh: {
        title: "预约系统",
    } as const,
    en: {
        title: "Reservation System",
    } as const,
} as const;

export default Layout;