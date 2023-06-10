import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import {
    Box,
    Button,
    DialogContentText,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import Table, { TableSkeleton } from "utils/Table";
import { useSnackbar } from "providers/SnackbarProvider";
import * as React from "react";
import BinaryDialog from "utils/BinaryDialog";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import Roles from "./roles/Roles";

function Users() {
    const [users, setUsers] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [userRoles, setUserRoles] = React.useState<Record<string, any>>({});
    const [reset, setReset] = React.useState<Record<string, any>|null>(null); // user to reset password

    React.useEffect(() => {
        fetch(api_paths.admin.users)
            .then(res => res.json())
            .then(data => {
                setUsers(data);
            })
            .catch(err => {
                console.error(err);
                setUsers([]);
            });
    }, []);

    React.useEffect(() => {
        fetch(api_paths.admin.user_roles)
            .then(res => res.json())
            .then(data => {
                setUserRoles(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.role] = cur;
                    return acc;
                }, {}));
            });
    }, []);

    const columns = [
        { field: 'username', label: '用户名' },
        { field: 'name', label: '姓名' },
        { field: 'role', label: '角色' },
        { field: 'email', label: '邮箱' },
        { field: 'actions', label: '操作', noSort: true },
    ];

    const renderValue = (row: Record<string, any>, field: string) => {
        switch (field) {
            case 'name':
                return (
                    <Typography noWrap sx={{ maxWidth: "70px" }}>
                        {row[field]}
                    </Typography>
                );
            case 'role':
                return (
                    <Typography noWrap sx={{ maxWidth: "80px" }}>
                        {userRoles[row[field]]?.label}
                    </Typography>
                );
            case 'actions':
                return (<>
                    <Tooltip title="编辑">
                        <IconButton size="small"
                            component={Link} to={`/admin/users/edit/${row.username}`}
                        >
                            <EditIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="重置密码">
                        <IconButton size="small"
                            onClick={() => { setReset(row); }}
                        >
                            <LockResetIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                </>);
            default:
                return row[field];
        }
    };

    return (
        <Box>
            <Typography variant="h5" component="h2">
                用户管理
            </Typography>
            {users !== undefined &&
            <Table
                columns={columns}
                rows={users}
                height='70vh'
                minWidth='600px'
                getValueLabel={renderValue}
            />}
            {users === undefined &&
            <TableSkeleton
                rowCount={15}
                columns={columns.map(column => column.label)}
                height='70vh'
                minWidth='600px'
            />}
            <Box display="flex" justifyContent="flex-end" pt={2}>
                <Button fullWidth variant="text" color="primary" startIcon={<AddIcon />}
                    component={Link} to="/admin/users/add"
                    >
                    添加用户
                </Button>
            </Box>
            <Roles />
            <ResetPasswordDialog user={reset} setUser={setReset} />
        </Box>
    );
}


interface ResetPasswordDialogProps {
    user: Record<string, any>|null;
    setUser: (user: Record<string, any>|null) => void;
}

function ResetPasswordDialog(props: ResetPasswordDialogProps) {
    const { user, setUser } = props;
    const { showSnackbar } = useSnackbar();

    const handleClose = () => {
        setUser(null);
    };

    const handleResetPassword = () => {
        if (user === null) return;
        fetch(api_paths.admin.users + `/${user.username}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: user.username }),
        })
            .then(res => {
                if (res.ok) {
                    showSnackbar({message: '重置密码成功', severity: 'success', duration: 2000});
                    handleClose();
                } else {
                    throw new Error('重置密码失败');
                }
            })
            .catch(err => {
                showSnackbar({message: err.message, severity: 'error'});
            });
    };

    return (
        <BinaryDialog
            open={user !== null} onConfirm={handleResetPassword} onClose={handleClose}
            title="重置密码" 
            content={<DialogContentText>
                确定要重置用户 <b>{user?.username}</b> 的密码吗？<br />重置后的密码为用户名：<b>{user?.username}</b>
            </DialogContentText>}
        />
    );
}

export default Users;