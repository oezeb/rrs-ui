import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import Switch from '@mui/material/Switch';
import * as React from "react";

import Table, { TableSkeleton } from "utils/Table";
import dayjs from "dayjs";
import { useSnackbar } from "providers/SnackbarProvider";
import BinaryDialog from "utils/BinaryDialog";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { descComp } from "utils/util";

function Sessions() {
    const [sessions, setSessions] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [del, setDel] = React.useState<Record<string, any>|null>(null);

    const {showSnackbar} = useSnackbar();

    React.useEffect(() => {
        fetch(api_paths.admin.sessions)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setSessions(data
                .map((session: Record<string, any>) => ({
                    ...session,
                    start_time: dayjs(session.start_time),
                    end_time: dayjs(session.end_time),
                }))
            ))
            .catch(err => {
                console.error(err);
                setSessions([]);
            });
    }, []);

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
        { field: 'actions', label: '操作', noSort: true },
    ];
    
    const renderValue = (row: Record<string, any>, field: string) => {
        switch (field) {
            case "name":
                return(
                    <Typography noWrap style={{maxWidth: "130px"}}>
                        {row[field]}
                    </Typography>
                );
            case "start_time":
            case "end_time":
                return row[field].format("YYYY-MM-DD HH:mm");
            case "is_current":
                return row[field] ? "是" : "否";
            case "actions":
                return (<>
                    <Tooltip title="编辑">
                        <IconButton size="small"
                            component={Link} to={`/admin/sessions/edit/${row.session_id}`}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="删除">
                        <IconButton size="small"
                            onClick={() => { setDel(row); }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={row.is_current ? "取消当前会话" : "设为当前会话"}>
                        <IconButton size="small">
                            <Switch size="small"
                                checked={row.is_current}
                                onChange={() => { toggleCurrent(row); }}
                            />
                        </IconButton>
                    </Tooltip>
                </>);
            default:
                return row[field];
        }
    };
    
    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                会话管理
            </Typography>
            {sessions !== undefined && 
            <Table
                columns={columns}
                rows={sessions}
                compare={comparator}
                height="70vh"
                minWidth="730px"
                getValueLabel={renderValue}
            />}
            {sessions === undefined &&
            <TableSkeleton
                rowCount={14}
                columns={columns.map(c => c.label)}
                height="70vh"
                minWidth="730px"
            />}
            <Button fullWidth variant="text" color="primary" startIcon={<AddIcon />}
                component={Link} to="/admin/sessions/add">
                添加会话
            </Button>
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