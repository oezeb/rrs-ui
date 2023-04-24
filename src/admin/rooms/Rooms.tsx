import * as React from "react";
import { 
    Box,  
    Typography, 
    FormHelperText, 
    Button,
    IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TableSortLabel from '@mui/material/TableSortLabel';

import { useSnackbar } from "../../SnackbarProvider";
import { statusColors } from "../../rooms/RoomDetails";
import { Link } from "../../Navigate";
import BinaryDialog from "../../BinaryDialog";
import { getComparator } from "../../util";
import Types from "./types/Types";
import Status from "./status/Status";

function Rooms() {
    const [rooms, setRooms] = React.useState<Record<string, any>[]>([]);
    const [orderBy, setOrderBy] = React.useState<string>("room_id");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);
    const [roomTypes, setRoomTypes] = React.useState<Record<string, any>>({});
    const [roomStatus, setRoomStatus] = React.useState<Record<string, any>>({});
    const [del, setDel] = React.useState<Record<string, any>|null>(null);

    React.useEffect(() => {
        fetch("/api/admin/rooms")
            .then(res => res.json())
            .then(data => {
                setRooms(data);
            });
    }, []);

    React.useEffect(() => {
        const comparator = getComparator(order, orderBy);
        const sorted = [...rooms].sort(comparator);
        setSorted(sorted);
    }, [rooms, order, orderBy]);

    React.useEffect(() => {
        fetch("/api/admin/room_types")
            .then(res => res.json())
            .then(data => {
                setRoomTypes(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.type] = cur;
                    return acc;
                }, {}));
            });
    }, []);

    React.useEffect(() => {
        fetch("/api/admin/room_status")
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
                >{props.label}</TableSortLabel>
            </TableCell>
        );
    };

    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                房间管理
            </Typography>
            <TableContainer sx={{minWidth: 750}}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <SortHeadCell field="room_id" label="房间号" />
                            <SortHeadCell field="name" label="房间名" />
                            <SortHeadCell field="capacity" label="容量" />
                            <SortHeadCell field="status" label="状态" />
                            <SortHeadCell field="type" label="类型" />
                            <TableCell>图片</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sorted.map((room, i) => {
                            console.log(room, i);
                            return (
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
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
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
    setRooms: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
}

const DeleteDialog = ({del, setDel, setRooms}: DeleteDialogProps) => {
    const { showSnackbar } = useSnackbar();

    const handleClose = () => {
        setDel(null);
    };

    const handleDelete = () => {
        fetch('/api/admin/rooms', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{room_id: del?.room_id}])
        })
        .then(res => {
            if (res.ok) {
                showSnackbar({message: "删除成功", severity: "success", duration: 2000});
                setRooms(old => old.filter(room => room.room_id !== del?.room_id));
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