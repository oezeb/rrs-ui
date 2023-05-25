import * as React from "react";
import Box from '@mui/material/Box';
import { Skeleton, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useAuth } from "./auth/AuthProvider";
import { useSnackbar } from "./SnackbarProvider";
import { paths as api_paths, user_role } from "./api";
import { EmailFieldParams } from "./auth/Register";
import { useLang } from "./LangProvider";

function Profile() {
    const [data, setData] = React.useState<Record<string, any>>({});
    const [msg, setMsg] = React.useState<Record<string, any>>({});
    const [roles, setRoles] = React.useState<Record<string, any>>({}); // 级别
    const { user, update } = useAuth();
    const { showSnackbar } = useSnackbar();

    const lang = useLang();

    const required_password = data.password !== undefined || data.new_password !== undefined || data.confirm_password !== undefined;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMsg({});
        if (Object.keys(data).length === 0) {
            showSnackbar({ message: "信息未改变", severity: "warning" });
            return;
        }

        if (required_password) {
            if (data.new_password !== data.confirm_password) {
                setMsg({ confirm_password: "两次输入的密码不一致" });
                return;
            }
        } else if (data.email === user?.email) {
            showSnackbar({ message: "信息未改变", severity: "warning" });
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
                        showSnackbar({ message: "修改成功", severity: "success" });
                    })
                } else if (res.status === 401) {
                    setMsg({ password: "密码错误" });
                } else {
                    showSnackbar({ message: "修改失败", severity: "error" });
                }
            })
            .catch((err) => {
                showSnackbar({ message: "修改失败", severity: "error" });
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
                {strings[lang]['personal information']}
            </Typography>
            <Table sx={{ mb: 3}}>
                <TableBody>
                    <TableRow>
                        <TableCell>{strings[lang]['username']}</TableCell>
                        <TableCell>{user? user.username:<Skeleton />}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{strings[lang]['name']}</TableCell>
                        <TableCell>{user? user.name:<Skeleton />}</TableCell>
                    </TableRow>
                    {user?.role > user_role.guest &&
                        <TableRow>
                            <TableCell>{strings[lang]['role']}</TableCell>
                            <TableCell>{user? roles[user.role]?.label:<Skeleton />}</TableCell>
                        </TableRow>
                    }
                    <TableRow>
                        <TableCell>{strings[lang]['email']}</TableCell>
                        <TableCell>
                            <TextField {...EmailFieldParams}
                                defaultValue={user?.email} placeholder="Email"
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
                {strings[lang]['change password']}
            </Typography>
                <TextField variant='standard' fullWidth id="password" name="password"
                    type="password"
                    required={required_password}
                    label={strings[lang]['old password']}
                    error={ 'password' in msg }
                    helperText={msg.password}
                    onChange={(e) => {
                        setData({ ...data, password: e.target.value });
                    }}
                />
                <TextField variant='standard' fullWidth id="new_password" name="new_password"
                    type="password"
                    required={required_password}
                    label={strings[lang]['new password']}
                    error={ 'confirm_password' in msg }
                    onChange={(e) => {
                        setData({ ...data, new_password: e.target.value });
                    }}
                />
                <TextField variant='standard' fullWidth id="confirm_password" name="confirm_password"
                    type="password"
                    required={required_password}
                    label={strings[lang]['confirm password']}
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
    'zh': {
        'personal information': '个人信息',
        'username': '用户名',
        'name': '姓名',
        'role': '角色',
        'email': '邮箱',
        'change password': '修改密码',
        'old password': '原密码',
        'new password': '新密码',
        'confirm password': '确认密码',
        'save': '保存',
    } as const,
    'en': {
        'personal information': 'Personal Information',
        'username': 'Username',
        'name': 'Name',
        'role': 'Role',
        'email': 'Email',
        'change password': 'Change Password',
        'old password': 'Old Password',
        'new password': 'New Password',
        'confirm password': 'Confirm Password',
        'save': 'Save',
    } as const,
} as const;


export default Profile;