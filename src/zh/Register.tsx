import strings from './strings.json';
import RootRegister from '../Register';

function Register() {
    return (
        <RootRegister
            strings={{...strings}}
            links={{
                home: '/',
                chineseVersion: '/register',
                englishVersion: '/en/register',
                login: '/login',
            }}
        />
    );
}

export default Register;