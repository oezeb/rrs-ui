import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    IconButton,
    Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
    Typography,
} from "@mui/material";
import TableSortLabel from '@mui/material/TableSortLabel';
import * as React from "react";

import { TableSkeleton } from "admin/Table";
import dayjs from "dayjs";
import { useSnackbar } from "providers/SnackbarProvider";
import BinaryDialog from "utils/BinaryDialog";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { descComp, getComparator } from "utils/util";

function Notices() {
    const [notices, setNotices] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [orderBy, setOrderBy] = React.useState<string>("notice_id");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);
    const [del, setDel] = React.useState<Record<string, any>|null>(null);

    const [users, setUsers] = React.useState<Record<string, any>>({});

    React.useEffect(() => {
        fetch(api_paths.admin.notices)
            .then(res => res.json())
            .then(data => {
                setNotices(data.map((notice: Record<string, any>) => ({
                    ...notice,
                    create_time: dayjs(notice.create_time),
                    update_time: notice.update_time ? dayjs(notice.update_time) : null,
                })));
            });

        fetch(api_paths.admin.users)
            .then(res => res.json())
            .then(data => {
                setUsers(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.username] = cur;
                    return acc;
                }, {}));
            });
    }, []);

    React.useEffect(() => {
        if (notices === undefined) return;
        const _comparator = getComparator(order, orderBy, comparator);
        const sorted = [...notices].sort(_comparator);
        setSorted(sorted);
    }, [notices, order, orderBy]);

    const comparator = (
        a: Record<string, any>,
        b: Record<string, any>,
        orderBy: string,
    ) => {
        if (orderBy === "create_time" || orderBy === "update_time") {
            if (a[orderBy] === null) {
                return 1;
            } else if (b[orderBy] === null) {
                return -1;
            } else if (b[orderBy].isBefore(a[orderBy])) {
                return -1;
            } else if (b[orderBy].isAfter(a[orderBy])) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return descComp(a, b, orderBy);
        }
    };

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            if (notices === undefined) return;
            const isAsc = orderBy === property && order === "asc";
            setOrder(isAsc ? "desc" : "asc");
            setOrderBy(property);
        
            const _comparator = getComparator(order, orderBy, comparator);
            const sorted = [...notices].sort(_comparator);
            setSorted(sorted);
        },
        [order, orderBy, notices],
    );

    const SortHeadCell = (props: {field: string, label: string}) => {
        return (
            <TableCell sortDirection={orderBy === props.field ? order : false}>
                <TableSortLabel
                    active={orderBy === props.field}
                    direction={orderBy === props.field ? order : "asc"}
                    onClick={(e) => { handleRequestSort(e, props.field); }}
                ><Typography fontWeight="bold">
                    {props.label}
                </Typography></TableSortLabel>
            </TableCell>
        );
    };

    const columns = [
        { field: "notice_id", label: "公告号" },
        { field: "username", label: "作者" },
        { field: "title", label: "标题" },
        { field: "create_time", label: "创建时间" },
        { field: "update_time", label: "更新时间" },
        { field: "actions", label: "操作", noSort: true },
    ];

    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                公告管理
            </Typography>
            {notices === undefined && 
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden', height: "70vh"}}>
                <TableSkeleton rowCount={15} columns={columns.map(column => column.label)} />
            </Paper>}
            {notices !== undefined &&
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ minWidth: 750, height: "70vh"}}>
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
                            {sorted.map((notice) => (
                                <TableRow key={notice.notice_id}>
                                    <TableCell>{notice.notice_id}</TableCell>
                                    <TableCell>{users[notice.username]?.name}</TableCell>
                                    <TableCell>{notice.title}</TableCell>
                                    <TableCell>{notice.create_time.format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                                    <TableCell>{notice.update_time?.format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                                    <TableCell>
                                        <Tooltip title="编辑">
                                            <IconButton 
                                                component={Link} 
                                                to={`/admin/notices/edit?notice_id=${notice.notice_id}&username=${notice.username}`}
                                                size="small"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="删除">
                                            <IconButton onClick={() => { setDel(notice); }}>
                                                <DeleteIcon fontSize="small" />
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
                    component={Link} to="/admin/notices/add" >
                    添加公告
                </Button>
            </Box>
            <DeleteDialog del={del} setDel={setDel} setNotices={setNotices} />
        </Box>
    );
}

interface DeleteDialogProps {
    del: Record<string, any>|null;
    setDel: React.Dispatch<React.SetStateAction<Record<string, any>|null>>;
    setNotices: React.Dispatch<React.SetStateAction<Record<string, any>[]|undefined>>;
}

const DeleteDialog = (props: DeleteDialogProps) => {
    const {del, setDel, setNotices} = props;
    const {showSnackbar} = useSnackbar();

    const handleClose = () => {
        setDel(null);
    };

    const handleDelete = () => {
        if (del === null) return;
        fetch(api_paths.admin.notices + `/${del.notice_id}/${del.username}`, {
            method: "DELETE",
        })
            .then(res => {
                if (res.ok) {
                    setNotices(old => old?.filter(notice => notice.notice_id !== del.notice_id));
                    showSnackbar({message: "删除成功", severity: "success", duration: 2000});
                    handleClose();
                } else {
                    throw new Error("删除失败");                
                }
            }).catch(err => {
                showSnackbar({message: err.message, severity: "error"});
                handleClose();
            });
    };

    return (
        <BinaryDialog
            open={del !== null}
            onConfirm={handleDelete}
            onClose={handleClose}
            title="删除公告"
            content={`确定要删除公告 “${del?.title}” 吗？`}
        />
    );
};

export default Notices;