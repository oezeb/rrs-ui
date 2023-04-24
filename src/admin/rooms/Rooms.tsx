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

import { useSnackbar } from "../../SnackbarProvider";
import { statusColors } from "../../rooms/RoomDetails";
import { Link } from "../../Navigate";
import { RoomTypesView } from "./types/Types";
import { RoomStatusView } from "./status/Status";
import BinaryDialog from "../../BinaryDialog";


function Rooms() {
    const [rooms, setRooms] = React.useState<Record<string, any>[]>([]);
    const [edited, setEdited] = React.useState<Record<string, any>[]>([]);
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
        setEdited(rooms);
    }, [rooms]);

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

    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                房间管理
            </Typography>
            <TableContainer sx={{minWidth: 600}}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>房间号</TableCell>
                            <TableCell>房间名</TableCell>
                            <TableCell>容量</TableCell>
                            <TableCell>状态</TableCell>
                            <TableCell>类型</TableCell>
                            <TableCell>图片</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {edited.map((room, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    {room.room_id}
                                </TableCell>
                                <TableCell>
                                    {room.name}
                                </TableCell>
                                <TableCell>
                                    {room.capacity}
                                </TableCell>
                                <TableCell>
                                    <Box display="inline" 
                                        borderBottom={3} 
                                        borderColor={statusColors[room.status]}
                                    >
                                        {roomStatus[room.status]?.label}
                                    </Box>
                                </TableCell>
                                <TableCell>
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
            <Box display="flex" justifyContent="flex-end" pt={2}>
                <Button fullWidth variant="text" color="primary" startIcon={<AddIcon />}
                    component={Link} to="/admin/rooms/add">
                    添加房间
                </Button>
            </Box>
            <RoomTypesView roomTypes={Object.values(roomTypes)} />
            <RoomStatusView roomStatus={Object.values(roomStatus)} />
            <DeleteDialog del={del} setDel={setDel} setRooms={setRooms} />
        </Box>
    );
}

interface DeleteDialogProps {
    del: Record<string, any>|null;
    setDel: (del: Record<string, any>|null) => void;
    setRooms: React.Dispatch<React.SetStateAction<Record<string, any>[]>>
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
            } else {
                showSnackbar({message: "删除失败", severity: "error"});
            }
            handleClose();
        })
        .catch(err => {
            showSnackbar({message: "删除失败", severity: "error"});
            handleClose();
        });
    };

    return (
        <BinaryDialog
            open={del !== null}
            title="删除房间"
            content={`确定要删除房间 ${del?.room_id} 吗？`}
            onClose={handleClose}
            onConfirm={handleDelete}
        />
    );
}

export default Rooms;