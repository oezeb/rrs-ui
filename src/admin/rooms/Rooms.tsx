import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    FormHelperText,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import * as React from "react";

import { useSnackbar } from "providers/SnackbarProvider";
import { roomStatusColors as statusColors } from 'utils/util';
import BinaryDialog from "utils/BinaryDialog";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import Table, { TableSkeleton } from "utils/Table";
import Status from "./status/Status";
import Types from "./types/Types";

function Rooms() {
    const [rooms, setRooms] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [roomTypes, setRoomTypes] = React.useState<Record<string, any>>({});
    const [roomStatus, setRoomStatus] = React.useState<Record<string, any>>({});
    const [del, setDel] = React.useState<Record<string, any>|null>(null);

    React.useEffect(() => {
        fetch(api_paths.admin.rooms)
            .then(res => res.json())
            .then(data => {
                setRooms(data);
            });
    }, []);

    React.useEffect(() => {
        fetch(api_paths.admin.room_types)
            .then(res => res.json())
            .then(data => {
                setRoomTypes(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.type] = cur;
                    return acc;
                }, {}));
            });
    }, []);

    React.useEffect(() => {
        fetch(api_paths.admin.room_status)
            .then(res => res.json())
            .then(data => {
                setRoomStatus(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.status] = cur;
                    return acc;
                }, {}));
            });
    }, []);

    const columns = [
        { field: 'room_id', label: '编号' },
        { field: 'name', label: '房间名' },
        { field: 'capacity', label: '容量' },
        { field: 'status', label: '状态' },
        { field: 'type', label: '类型' },
        { field: 'image', label: '图片', noSort: true },
        { field: 'actions', label: '操作', noSort: true },
    ];

    const renderValue = (row: Record<string, any>, field: string) => {
        switch (field) {
            case "name":
                return (
                    <Typography noWrap sx={{ maxWidth: "100px" }}>
                        {row[field]}
                    </Typography>
                );
            case "status":
            case "type":
                return (
                    <Typography noWrap sx={{ maxWidth: "70px" }}>
                        {field === "status" ? (
                        <Box component="span" 
                            borderBottom={3} 
                            borderColor={statusColors[row[field]]}
                        >
                            {roomStatus[row[field]]?.label}
                        </Box>
                        ) : roomTypes[row[field]]?.label}
                    </Typography>
                );
            case "image":
                return (
                    <Box display="flex">
                        <Box component="img" 
                            src={`data:image/png;base64,${row.image}`} 
                            maxWidth={50}
                        />
                        {row.image? null : <FormHelperText>无图片</FormHelperText>}
                    </Box>
                );
            case "actions":
                return (<>
                    <Tooltip title="删除">
                        <IconButton size="small"
                            onClick={() => setDel(row)}>
                            <DeleteIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="编辑">
                        <IconButton size="small"
                            component={Link} to={`/admin/rooms/edit/${row.room_id}`}
                        >
                            <EditIcon fontSize="inherit" />
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
                房间管理
            </Typography>
            {rooms !== undefined && 
            <Table
                columns={columns}
                rows={rooms}
                height="70vh"
                minWidth="700px"
                getValueLabel={renderValue}
            />}
            {rooms === undefined &&
            <TableSkeleton
                rowCount={12}
                columns={columns.map(column => column.label)}
                height="70vh"
                minWidth="750px"
            />}
            <Button fullWidth variant="text" color="primary" startIcon={<AddIcon />}
                component={Link} to="/admin/rooms/add">
                添加房间
            </Button>
            <Types />
            <Status />
            <DeleteDialog del={del} setDel={setDel} setRooms={setRooms} />
        </Box>
    );
}

interface DeleteDialogProps {
    del: Record<string, any>|null;
    setDel: (del: Record<string, any>|null) => void;
    setRooms: React.Dispatch<React.SetStateAction<Record<string, any>[]|undefined>>;
}

const DeleteDialog = ({del, setDel, setRooms}: DeleteDialogProps) => {
    const { showSnackbar } = useSnackbar();

    const handleClose = () => {
        setDel(null);
    };

    const handleDelete = () => {
        if (del === null) return;
        fetch(api_paths.admin.rooms + `/${del.room_id}`, { 
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
        })
            .then(res => {
                if (res.ok) {
                    showSnackbar({message: "删除成功", severity: "success", duration: 2000});
                    setRooms(old => old?.filter(room => room.room_id !== del.room_id));
                    handleClose();
                } else {
                    throw new Error("删除失败");
                }
            })
            .catch(err => {
                showSnackbar({message: "删除失败", severity: "error"});
                handleClose();
            });
    };

    return (
        <BinaryDialog
            open={del !== null} onConfirm={handleDelete} onClose={handleClose}
            title="删除房间"
            content={`确定要删除房间 ${del?.room_id} 吗？`}
        />
    );
}

export default Rooms;