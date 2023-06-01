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
import Switch from '@mui/material/Switch';
import TableSortLabel from '@mui/material/TableSortLabel';
import * as React from "react";

import { TableSkeleton } from "admin/Table";
import dayjs from "dayjs";
import { useSnackbar } from "providers/SnackbarProvider";
import BinaryDialog from "utils/BinaryDialog";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { descComp, getComparator } from "utils/util";

function Sessions() {
    const [sessions, setSessions] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [orderBy, setOrderBy] = React.useState<string>("session_id");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);
    const [del, setDel] = React.useState<Record<string, any>|null>(null);

    const {showSnackbar} = useSnackbar();

    React.useEffect(() => {
        fetch(api_paths.admin.sessions)
            .then(res => res.json())
            .then(data => {
                setSessions(data.map((session: Record<string, any>) => ({
                    ...session,
                    start_time: dayjs(session.start_time),
                    end_time: dayjs(session.end_time),
                })));
            });
    }, []);

    React.useEffect(() => {
        if (sessions === undefined) return;
        const _comparator = getComparator(order, orderBy, comparator);
        const sorted = [...sessions].sort(_comparator);
        setSorted(sorted);
    }, [sessions, order, orderBy]);

    const comparator = (
        a: Record<string, any>,
        b: Record<string, any>,
        orderBy: string,
    ) => {
        if (orderBy === "start_time" || orderBy === "end_time") {
            if (b[orderBy].isBefore(a[orderBy])) {
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
            if (sessions === undefined) return;
            const isAsc = orderBy === property && order === 'asc';
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(property);

            const _comparator = getComparator(order, orderBy, comparator);
            const sorted = [...sessions].sort(_comparator);
            setSorted(sorted);
        },
        [orderBy, order, sessions],
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

    const toggleCurrent = (session: Record<string, any>) => {
        if (sessions === undefined) return;
        let promises: Promise<any>[] = [];
        for (let s of sessions.filter(s => s.is_current && s.session_id !== session.session_id)) {
            promises.push(fetch(api_paths.admin.sessions + `/${s.session_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_current: false }),
            }));
        }
        promises.push(fetch(api_paths.admin.sessions + `/${session.session_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_current: !session.is_current }),
        }));
        Promise.all(promises)
            .then(res => {
                if (res.every(r => r.ok)) {
                    setSessions(sessions.map(s => s.session_id === session.session_id ?
                        { ...s, is_current: !s.is_current } :
                        { ...s, is_current: false }));
                    showSnackbar({message: "切换当前会话成功", severity: "success", duration: 2000});
                } else {
                    throw new Error();
                }
            })
            .catch(err => {
                showSnackbar({message: "切换当前会话失败", severity: "error"});
            });
    };

    const columns = [
        { field: 'session_id', label: '会话号' },
        { field: 'name', label: '会话名' },
        { field: 'start_time', label: '开始时间' },
        { field: 'end_time', label: '结束时间' },
        { field: 'is_current', label: '当前会话' },
        { field: 'actions', label: '操作', noSort: true },
    ];
    
    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                会话管理
            </Typography>
            {sessions === undefined &&
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden', height: "70vh"}}>
                <TableSkeleton rowCount={15} columns={columns.map(column => column.label)} />
            </Paper>}
            {sessions !== undefined && 
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ height: "70vh"}}>
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
                            {sorted.map((session, i) => (
                                <TableRow key={i}>
                                    <TableCell>{session.session_id}</TableCell>
                                    <TableCell>{session.name}</TableCell>
                                    <TableCell>{session.start_time.format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                                    <TableCell>{session.end_time.format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                                    <TableCell>{session.is_current ? "是" : "否"}</TableCell>
                                    <TableCell>
                                        <Tooltip title="编辑">
                                            <IconButton size="small"
                                                component={Link} to={`/admin/sessions/edit?session_id=${session.session_id}`}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="删除">
                                            <IconButton size="small"
                                                onClick={() => { setDel(session); }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={session.is_current ? "取消当前会话" : "设为当前会话"}>
                                            <IconButton size="small">
                                                <Switch size="small"
                                                    checked={session.is_current}
                                                    onChange={() => { toggleCurrent(session); }}
                                                />
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
                    component={Link} to="/admin/sessions/add">
                    添加会话
                </Button>
            </Box>
            <DeleteDialog del={del} setDel={setDel} setSessions={setSessions} />
        </Box>
    );
}

interface DeleteDialogProps {
    del: Record<string, any>|null;
    setDel: (del: Record<string, any>|null) => void;
    setSessions: React.Dispatch<React.SetStateAction<Record<string, any>[]|undefined>>;
}

const DeleteDialog = ({ del, setDel, setSessions }: DeleteDialogProps) => {
    const {showSnackbar} = useSnackbar();

    const handleClose = () => {
        setDel(null);
    };

    const handleDelete = () => {
        if (del === null) return;
        fetch(api_paths.admin.sessions + `/${del.session_id}`, {
            method: "DELETE",
        })
            .then(res => {
                if (res.ok) {
                    setSessions(sessions => sessions?.filter(s => s.session_id !== del.session_id));
                    showSnackbar({message: "删除会话成功", severity: "success", duration: 2000});
                    handleClose();
                } else {
                    throw new Error("删除会话失败");
                }
            })
            .catch(err => {
                console.error(err);
                showSnackbar({message: "删除会话失败", severity: "error"});
            });
    };

    return (
        <BinaryDialog
            open={del !== null} onConfirm={handleDelete} onClose={handleClose}
            title="删除会话"
            content={`确定要删除会话 ${del?.name} 吗？`}
        />
    );
};

export default Sessions;