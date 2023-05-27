import { Skeleton, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { EmailFieldParams } from "utils/util";
import { useAuth } from "providers/AuthProvider";
import { useLang } from "providers/LangProvider";
import { useSnackbar } from "providers/SnackbarProvider";
import * as React from "react";

import { paths as api_paths, user_role } from "utils/api";

function Profile() {
    const [data, setData] = React.useState<Record<string, any>>({});
    const [msg, setMsg] = React.useState<Record<string, any>>({});
    const [roles, setRoles] = React.useState<Record<string, any>>({});
    const { user, update } = useAuth();
    const { showSnackbar } = useSnackbar();

    const lang = useLang();

    const required_password = data.password !== undefined || data.new_password !== undefined || data.confirm_password !== undefined;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMsg({});
        if (Object.keys(data).length === 0) {
            showSnackbar({ message: strings[lang].informationUnchanged, severity: "warning" });
            return;
        }

        if (required_password) {
            if (data.new_password !== data.confirm_password) {
                setMsg({ confirm_password: strings[lang].passwordsNotMatch });
                return;
            }
        } else if (data.email === user?.email) {
            showSnackbar({ message: strings[lang].informationUnchanged, severity: "warning" });
            return;
        }

        fetch(api_paths.user, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: data.email,
                password: data.password,
                new_password: data.new_password,
            }),
        })
            .then((res) => {
                if (res.ok) {
                    update(res => {
                        setData({});
                        showSnackbar({ message: strings[lang].updateSuccess, severity: "success", duration: 2000 });
                    })
                } else if (res.status === 401) {
                    setMsg({ password: strings[lang].passwordIncorrect });
                } else {
                    throw new Error();
                }
            })
            .catch((err) => {
                showSnackbar({ message: strings[lang].updateFailed, severity: "error" });
            });
    };

    React.useEffect(() => {
        fetch(api_paths.user_roles)
            .then((res) => res.json())
            .then((data) => {
                setRoles(data.reduce((obj: Record<string, any>, item: Record<string, any>) => {
                    obj[item.role] = item;
                    return obj;
                }, {}));
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);


    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h2" gutterBottom>
                {strings[lang].personalInformation}
            </Typography>
            <Table sx={{ mb: 3}}>
                <TableBody>
                    <TableRow>
                        <TableCell>{strings[lang].username}</TableCell>
                        <TableCell>{user? user.username:<Skeleton />}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{strings[lang].name}</TableCell>
                        <TableCell>{user? user.name:<Skeleton />}</TableCell>
                    </TableRow>
                    {user?.role > user_role.guest &&
                        <TableRow>
                            <TableCell>{strings[lang].role}</TableCell>
                            <TableCell>{user? roles[user.role]?.label:<Skeleton />}</TableCell>
                        </TableRow>
                    }
                    <TableRow>
                        <TableCell>{strings[lang].email}</TableCell>
                        <TableCell>
                            <TextField {...EmailFieldParams}
                                defaultValue={user?.email} 
                                placeholder={strings[lang].email}
                                label={undefined}
                                InputProps={{ disableUnderline: true }}
                                onChange={(e) => {
                                    setData({ ...data, email: e.target.value });
                                }}
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Typography variant="h5" component="h2" gutterBottom>
                {strings[lang].changePassword}
            </Typography>
                <TextField variant='standard' fullWidth id="password" name="password"
                    type="password"
                    required={required_password}
                    label={strings[lang].oldPassword}
                    error={ 'password' in msg }
                    helperText={msg.password}
                    onChange={(e) => {
                        setData({ ...data, password: e.target.value });
                    }}
                />
                <TextField variant='standard' fullWidth id="new_password" name="new_password"
                    type="password"
                    required={required_password}
                    label={strings[lang].newPassword}
                    error={ 'confirm_password' in msg }
                    onChange={(e) => {
                        setData({ ...data, new_password: e.target.value });
                    }}
                />
                <TextField variant='standard' fullWidth id="confirm_password" name="confirm_password"
                    type="password"
                    required={required_password}
                    label={strings[lang].confirmPassword}
                    error={ 'confirm_password' in msg }
                    helperText={msg.confirm_password}
                    onChange={(e) => {
                        setData({ ...data, confirm_password: e.target.value });
                    }}
                />
                <Button  type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    {strings[lang]['save']}
                </Button>
        </Box>
    );
}

const strings = {
    zh: {
        personalInformation: '个人信息',
        username: '用户名',
        name: '姓名',
        role: '角色',
        email: '邮箱',
        changePassword: '修改密码',
        oldPassword: '原密码',
        newPassword: '新密码',
        confirmPassword: '确认密码',
        save: '保存',

        informationUnchanged: '信息未改变',
        passwordIncorrect: '密码错误',
        passwordsNotMatch: '两次输入的密码不一致',
        updateFailed: '修改失败',
        updateSuccess: '修改成功',
    } as const,
    en: {
        personalInformation: 'Personal Information',
        username: 'Username',
        name: 'Name',
        role: 'Role',
        email: 'Email',
        changePassword: 'Change Password',
        oldPassword: 'Old Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        save: 'Save',

        informationUnchanged: 'Information unchanged',
        passwordIncorrect: 'Password incorrect',
        passwordsNotMatch: 'Passwords not match',
        updateFailed: 'Change failed',
        updateSuccess: 'Change succeeded',
    } as const,
} as const;

export default Profile;