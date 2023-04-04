import strings from "./strings.json";
import RootHome from "../Home";

export default function Home() {
    return (
        <RootHome
            strings={{...strings}}
            links={{
                home: '/en',
                chineseVersion: '/',
                englishVersion: '/en',
                login: '/en/login',
            }}
        />
    );
}


