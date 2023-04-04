import strings from "./strings.json";
import RootHome from "../Home";

export default function Home() {
    return (
        <RootHome
            strings={{...strings}}
            links={{
                    home: '/',
                    chineseVersion: '/',
                    englishVersion: '/en',
                    login: '/login',
            }}
        />
    );
}