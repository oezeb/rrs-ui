import { Skeleton, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { EmailFieldParams } from "utils/util";
import { useAuth } from "providers/AuthProvider";
import { useSnackbar } from "providers/SnackbarProvider";
import * as React from "react";

import { paths as api_paths, user_role } from "utils/api";

function Profile() {
    const [data, setData] = React.useState<Record<string, any>>({});
    const [msg, setMsg] = React.useState<Record<string, any>>({});
    const [roles, setRoles] = React.useState<Record<string, any>>({});
    const { user, update } = useAuth();
    const { showSnackbar } = useSnackbar();

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
                        showSnackbar({ message: "修改成功", severity: "success", duration: 2000 });
                    })
                } else if (res.status === 401) {
                    setMsg({ password: "密码错误" });
                } else {
                    throw new Error();
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
                个人信息
            </Typography>
            <Table sx={{ mb: 3}}>
                <TableBody>
                    <TableRow>
                        <TableCell>用户名</TableCell>
                        <TableCell>{user? user.username:<Skeleton />}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>姓名</TableCell>
                        <TableCell>{user? user.name:<Skeleton />}</TableCell>
                    </TableRow>
                    {user?.role > user_role.guest &&
                        <TableRow>
                            <TableCell>角色</TableCell>
                            <TableCell>{user? roles[user.role]?.label:<Skeleton />}</TableCell>
                        </TableRow>
                    }
                    <TableRow>
                        <TableCell>邮箱</TableCell>
                        <TableCell>
                            <TextField {...EmailFieldParams}
                                defaultValue={user?.email} 
                                placeholder="邮箱"
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
                修改密码
            </Typography>
            <TextField variant='standard' fullWidth id="password" name="password"
                type="password"
                required={required_password}
                label="原密码"
                error={ 'password' in msg }
                helperText={msg.password}
                onChange={(e) => {
                    setData({ ...data, password: e.target.value });
                }}
            />
            <TextField variant='standard' fullWidth id="new_password" name="new_password"
                type="password"
                required={required_password}
                label="新密码"
                error={ 'confirm_password' in msg }
                onChange={(e) => {
                    setData({ ...data, new_password: e.target.value });
                }}
            />
            <TextField variant='standard' fullWidth id="confirm_password" name="confirm_password"
                type="password"
                required={required_password}
                label="确认密码"
                error={ 'confirm_password' in msg }
                helperText={msg.confirm_password}
                onChange={(e) => {
                    setData({ ...data, confirm_password: e.target.value });
                }}
            />
            <Button  type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                保存
            </Button>
        </Box>
    );
}

export default Profile;