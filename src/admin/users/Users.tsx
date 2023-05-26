import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import {
    Box,
    Button,
    DialogContentText,
    IconButton,
    Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
    Typography,
} from "@mui/material";
import TableSortLabel from '@mui/material/TableSortLabel';
import { TableSkeleton } from "admin/Table";
import { useSnackbar } from "providers/SnackbarProvider";
import * as React from "react";
import BinaryDialog from "utils/BinaryDialog";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { getComparator } from "utils/util";
import Roles from "./roles/Roles";

function Users() {
    const [users, setUsers] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [orderBy, setOrderBy] = React.useState('username');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);
    const [reset, setReset] = React.useState<Record<string, any>|null>(null); // user to reset password
    const [userRoles, setUserRoles] = React.useState<Record<string, any>>({});

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
        if (users === undefined) return;
        const comparator = getComparator(order, orderBy);
        const sorted = [...users].sort(comparator);
        setSorted(sorted);
    }, [users, order, orderBy]);

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

    const onRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            if (users === undefined) return;
            const isAsc = orderBy === property && order === 'asc';
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(property);

            const comparator = getComparator(order, orderBy);
            const sorted = [...users].sort(comparator);
            setSorted(sorted);
        },
        [order, orderBy, users],
    );

    const SortHeadCell = (props: {field: string, label: string}) => (
        <TableCell sortDirection={orderBy === props.field ? order : false}>
            <TableSortLabel
                active={orderBy === props.field}
                direction={orderBy === props.field ? order : "asc"}
                onClick={(e) => { onRequestSort(e, props.field); }}
            ><Typography fontWeight="bold">
                {props.label}
            </Typography>
            </TableSortLabel>
        </TableCell>
    );

    const columns = [
        { field: 'username', label: '用户名' },
        { field: 'name', label: '姓名' },
        { field: 'role', label: '角色' },
        { field: 'email', label: '邮箱' },
        { field: 'action', label: '操作', noSort: true },
    ];

    return (
        <Box>
            <Typography variant="h5" component="h2">
                用户管理
            </Typography>
            {users === undefined &&
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden', height: "70vh"}}>
                <TableSkeleton rowCount={15} columns={columns.map(column => column.label)} />
            </Paper>}
            { users !== undefined &&
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ minWidth:700, height: "70vh"}}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {columns.map((col, i) => (
                                    col.noSort ?
                                    <TableCell key={i}><Typography fontWeight="bold">{col.label}</Typography></TableCell> :
                                    <SortHeadCell key={i} field={col.field} label={col.label} />
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sorted.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell>{row.username}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{userRoles[row.role]?.label}</TableCell>
                                    <TableCell>{row.email}</TableCell>
                                    <TableCell>
                                        <Tooltip title="编辑">
                                            <IconButton size="small"
                                                component={Link} to={`/admin/users/edit?username=${row.username}`}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="重置密码">
                                            <IconButton size="small"
                                                onClick={() => { setReset(row); }}
                                            >
                                                <LockResetIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>}
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