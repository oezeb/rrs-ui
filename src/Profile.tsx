import * as React from "react";
import Box from '@mui/material/Box';
import { Alert,  Skeleton, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useAuth } from "./AuthProvider";

function Profile() {
    const [data, setData] = React.useState<Record<string, any>>({});
    const [msg, setMsg] = React.useState<Record<string, any>>({});
    const [open, setOpen] = React.useState(false); // snackbar
    const { user, update } = useAuth();

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpen(false);
    };

    const required_password = data.password || data.new_password || data.confirm_password;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMsg({});
        if (Object.keys(data).length === 0) {
            setMsg({ snackbar: { message: "信息未改变", severity: "warning" } });
            return;
        }

        if (required_password) {
            if (data.new_password !== data.confirm_password) {
                setMsg({ confirm_password: "两次输入的密码不一致" });
                return;
            }
        } else if (data.email === user?.email) {
            setMsg({ snackbar: { message: "信息未改变", severity: "warning" } });
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
                        setMsg({ snackbar: { message: "修改成功", severity: "success" } });
                        setData({});
                        setOpen(true);
                    })
                } else if (res.status === 401) {
                    setMsg({ password: "密码错误" });
                } else {
                    setMsg({ snackbar: { message: "修改失败", severity: "error" } });
                    setOpen(true);
                }
            })
            .catch((err) => {
                setMsg({ snackbar: { message: "修改失败", severity: "error" } });
                setOpen(true);
            });
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h2" gutterBottom>
                个人信息
            </Typography>
            <Table sx={{ mb: 3}}>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            用户名
                        </TableCell>
                        <TableCell>{user? user.username:<Skeleton />}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            姓名
                        </TableCell>
                        <TableCell>{user? user.name:<Skeleton />}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            邮箱
                        </TableCell>
                        <TableCell>
                            <TextField
                                variant='standard'
                                id="email"
                                placeholder="Email"
                                name="email"
                                size="small"
                                defaultValue={user?.email}
                                InputProps={{
                                    disableUnderline: true,
                                }}
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
                <TextField
                    variant='standard'
                    required={required_password}
                    fullWidth
                    id="password"
                    label="原密码"
                    name="password"
                    type="password"
                    error={ 'password' in msg }
                    helperText={msg.password}
                    onChange={(e) => {
                        setData({ ...data, password: e.target.value });
                    }}
                />
                <TextField
                    variant='standard'
                    required={required_password}
                    fullWidth
                    id="new_password"
                    label="新密码"
                    name="new_password"
                    type="password"
                    error={ 'confirm_password' in msg }
                    onChange={(e) => {
                        setData({ ...data, new_password: e.target.value });
                    }}
                />
                <TextField
                    variant='standard'
                    required={required_password}
                    fullWidth
                    id="confirm_password"
                    label="确认密码"
                    name="confirm_password"
                    type="password"
                    error={ 'confirm_password' in msg }
                    helperText={msg.confirm_password}
                    onChange={(e) => {
                        setData({ ...data, confirm_password: e.target.value });
                    }}
                />
                <Button  type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    保存
                </Button>
                <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity={msg.snackbar?.severity} sx={{ width: '100%' }}>
                        {msg.snackbar?.message}
                    </Alert>
                </Snackbar>
        </Box>
    );
}

export default Profile;