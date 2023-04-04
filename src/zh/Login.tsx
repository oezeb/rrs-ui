import strings from './strings.json';
import RootLogin from '../Login';

function Login() {
    return (
        <RootLogin 
            strings={{...strings}}
            links={{
                home: '/',
                chineseVersion: '/login',
                englishVersion: '/en/login',
                register: '/register',
            }}
        />
    );
}

export default Login;