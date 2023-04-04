import strings from './strings.json';
import RootRegister from '../Register';

function Register() {
    return (
        <RootRegister 
            strings={{...strings}}
            links={{
                home: '/en',
                chineseVersion: '/register',
                englishVersion: '/en/register',
                login: '/en/login',
            }}
        />
    );
}

export default Register;