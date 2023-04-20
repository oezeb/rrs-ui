import * as React from "react";
import Box from '@mui/material/Box';
import { Skeleton, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useAuth } from "./auth/AuthProvider";
import { useSnackbar } from "./SnackbarProvider";
import { email_regex } from "./util";

function Profile() {
    const [data, setData] = React.useState<Record<string, any>>({});
    const [msg, setMsg] = React.useState<Record<string, any>>({});
    const [roleList, setRoleList] = React.useState<Record<string, any>>({}); // 级别
    const { user, update } = useAuth();
    const { show } = useSnackbar();

    const required_password = data.password || data.new_password || data.confirm_password;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMsg({});
        if (Object.keys(data).length === 0) {
            show({ message: "信息未改变", severity: "warning" });
            return;
        }

        if (required_password) {
            if (data.new_password !== data.confirm_password) {
                setMsg({ confirm_password: "两次输入的密码不一致" });
                return;
            }
        } else if (data.email === user?.email) {
            show({ message: "信息未改变", severity: "warning" });
            return;
        }

        fetch('/api/user', {
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
                        show({ message: "修改成功", severity: "success" });
                    })
                } else if (res.status === 401) {
                    setMsg({ password: "密码错误" });
                } else {
                    show({ message: "修改失败", severity: "error" });
                }
            })
            .catch((err) => {
                show({ message: "修改失败", severity: "error" });
            });
    };

    React.useEffect(() => {
        fetch('/api/user_roles')
            .then((res) => res.json())
            .then((data) => {
                setRoleList(data);
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
                    {user?.role > 0 &&
                        <TableRow>
                            <TableCell>级别</TableCell>
                            <TableCell>{user? roleList[user.role+1]?.label:<Skeleton />}</TableCell>
                        </TableRow>
                    }
                    <TableRow>
                        <TableCell>邮箱</TableCell>
                        <TableCell>
                            <TextField variant='standard' id="email" name="email" size="small" 
                                defaultValue={user?.email} placeholder="Email"
                                inputProps={{ pattern: `${email_regex.source}` }}
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