import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    FormHelperText,
    IconButton,
    Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
    Typography,
} from "@mui/material";
import TableSortLabel from '@mui/material/TableSortLabel';
import * as React from "react";

import { useSnackbar } from "providers/SnackbarProvider";
import { statusColors } from "rooms/RoomDetails";
import BinaryDialog from "utils/BinaryDialog";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { getComparator } from "utils/util";
import { TableSkeleton } from "admin/Table";
import Status from "./status/Status";
import Types from "./types/Types";

function Rooms() {
    const [rooms, setRooms] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [orderBy, setOrderBy] = React.useState<string>("room_id");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);
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
        if (rooms === undefined) return;
        const comparator = getComparator(order, orderBy);
        const sorted = [...rooms].sort(comparator);
        setSorted(sorted);
    }, [rooms, order, orderBy]);

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

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            if (rooms === undefined) return;
            const isAsc = orderBy === property && order === 'asc';
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(property);

            const comparator = getComparator(order, orderBy);
            const sorted = [...rooms].sort(comparator);
            setSorted(sorted);
        },
        [orderBy, order, rooms],
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
        { field: 'room_id', label: '房间号' },
        { field: 'name', label: '房间名' },
        { field: 'capacity', label: '容量' },
        { field: 'status', label: '状态' },
        { field: 'type', label: '类型' },
        { field: 'image', label: '图片', noSort: true },
        { field: 'action', label: '操作', noSort: true },
    ];

    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                房间管理
            </Typography>
            {rooms === undefined &&
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden', height: "70vh"}}>
                <TableSkeleton rowCount={15} columns={columns.map(column => column.label)} />
            </Paper>}
            {rooms !== undefined && 
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ minWidth: 750, height: "70vh"}}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {columns.map((column, i) => (
                                    column.noSort ? 
                                    <TableCell key={i}><Typography fontWeight="bold">{column.label}</Typography></TableCell>:
                                    <SortHeadCell key={i} field={column.field} label={column.label} />
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sorted.map((room, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        {room.room_id}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            maxWidth: 150,
                                            overflow: "hidden", textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {room.name}
                                    </TableCell>
                                    <TableCell>
                                        {room.capacity}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            maxWidth: 150,
                                            overflow: "hidden", textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        <Box display="inline" 
                                            borderBottom={3} 
                                            borderColor={statusColors[room.status]}
                                        >
                                            {roomStatus[room.status]?.label}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            maxWidth: 150,
                                            overflow: "hidden", textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {roomTypes[room.type]?.label}
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex">
                                                <Box component="img" 
                                                src={`data:image/png;base64,${room.image}`} 
                                                alt={room.room_name} 
                                                maxWidth={50} 
                                                />
                                        {room.image? null : <FormHelperText>无图片</FormHelperText>}</Box>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="删除">
                                            <IconButton size="small"
                                                onClick={() => setDel(room)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="编辑">
                                            <IconButton size="small"
                                                component={Link} to={`/admin/rooms/edit?room_id=${room.room_id}`}>
                                                <EditIcon fontSize="small" />
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
                    component={Link} to="/admin/rooms/add">
                    添加房间
                </Button>
            </Box>
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