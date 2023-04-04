import RootLogin from '../Login';
import strings from './strings.json';

function Login() {
    return (
        <RootLogin 
            strings={{...strings}}
            links={{
                home: '/en',
                chineseVersion: '/login',
                englishVersion: '/en/login',
                register: '/en/register',
            }}
        />
    );
}

export default Login;