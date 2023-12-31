import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    Typography,
    Skeleton,
} from "@mui/material";
import Table, { TableSkeleton } from "utils/Table";
import dayjs from "dayjs";
import * as React from "react";

import { useSnackbar } from "providers/SnackbarProvider";
import BinaryDialog from "utils/BinaryDialog";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { descComp } from "utils/util";

function Notices() {
    const [notices, setNotices] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [users, setUsers] = React.useState<Record<string, any>>({});
    const [del, setDel] = React.useState<Record<string, any>|null>(null);

    React.useEffect(() => {
        fetch(api_paths.admin.notices)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setNotices(data
                .map((notice: Record<string, any>) => ({
                    ...notice,
                    create_time: dayjs(notice.create_time),
                    update_time: notice.update_time ? dayjs(notice.update_time) : null,
                }))
            ))
            .catch(err => {
                console.error(err);
                setNotices([]);
            });

        fetch(api_paths.admin.users)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                setUsers(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.username] = cur;
                    return acc;
                }, {}));
            })
            .catch(err => console.log(err));
    }, []);

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

    const columns = [
        { field: "notice_id", label: "公告号" },
        { field: "username", label: "作者" },
        { field: "title", label: "标题" },
        { field: "create_time", label: "创建时间" },
        { field: "update_time", label: "更新时间" },
        { field: "actions", label: "操作", noSort: true },
    ];

    const renderValue = (row: Record<string, any>, field: string) => {
        switch (field) {
            case "username":
                return (
                <Typography noWrap sx={{ maxWidth: 70 }}>
                    {users[row[field]]?.name??<Skeleton />}
                </Typography>
                );
            case "title":
                return (
                <Typography noWrap sx={{ maxWidth: 100 }}>
                    {row[field]}
                </Typography>
                );
            case "create_time":
            case "update_time":
                return row[field]?.format("YYYY-MM-DD HH:mm");
            case "actions":
                return (<>
                    <Tooltip title="编辑">
                        <IconButton
                            component={Link}
                            to={`/admin/notices/edit/${row.notice_id}/${row.username}`}
                            size="small"
                        >
                            <EditIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="删除">
                        <IconButton onClick={() => { setDel(row); }} size="small">
                            <DeleteIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                </>);
            default:
                return row[field];
        }
    };

    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                公告管理
            </Typography>
            {notices !== undefined &&
            <Table
                columns={columns}
                rows={notices}
                compare={comparator}
                minWidth="800px"
                height="70vh"
                getValueLabel={renderValue}
            />}
            {notices === undefined && 
            <TableSkeleton
                rowCount={14} 
                columns={columns.map(column => column.label)} 
                minWidth='800px'
                height='70vh'
            />}
            <Button fullWidth 
                startIcon={<AddIcon />}
                component={Link} to="/admin/notices/add" >
                添加公告
            </Button>
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