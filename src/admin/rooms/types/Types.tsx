import * as React from "react";
import { 
    Box,  
    Typography, 
    Button,
    IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { Link } from "../../../Navigate";
import { useSnackbar } from "../../../SnackbarProvider";
import BinaryDialog from "../../../BinaryDialog";

function Types() {
    const [roomTypes, setRoomTypes] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        fetch("/api/admin/room_types")
            .then(res => res.json())
            .then(data => {
                setRoomTypes(data);
            });
    }, []);

    return (
        <RoomTypesView roomTypes={roomTypes} />
    );
}

export function RoomTypesView({ roomTypes }: { roomTypes: Record<string, any>[] }) {
    const [del, setDel] = React.useState<Record<string, any>|null>(null);
    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                房间类型
            </Typography>
            <TableContainer sx={{minWidth: 600}}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>类型</TableCell>
                            <TableCell>标签</TableCell>
                            <TableCell>说明</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.values(roomTypes).map((roomType: Record<string, any>, i) => (
                            <TableRow key={i}>
                                <TableCell>{roomType.type}</TableCell>
                                <TableCell>{roomType.label}</TableCell>
                                <TableCell>{roomType.description?? "无"}</TableCell>
                                <TableCell>
                                    <Tooltip title="删除">
                                        <IconButton size="small" onClick={() => setDel(roomType)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="编辑">
                                        <IconButton size="small"
                                            component={Link} to={`/admin/rooms/types/edit?type=${roomType.type}`}
                                        >
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
                    component={Link} to="/admin/rooms/types/add">
                    添加类型
                </Button>
            </Box>
            <DeleteDialog del={del} setDel={setDel} />
        </Box>
    );
}

const DeleteDialog = ({ del, setDel }: { del: Record<string, any>|null, setDel: (del: Record<string, any>|null) => void }) => {
    const { showSnackbar } = useSnackbar();
    const handleClose = () => {
        setDel(null);
    };

    const handleDelete = () => {
        fetch('/api/admin/room_types', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{type: del?.type}])
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showSnackbar({message: "删除成功", severity: "success", duration: 2000});
            } else {
                showSnackbar({message: `删除失败。请确保类型 ${del?.type} 没有被任何房间使用。`, severity: "error"});
            }
            handleClose();
        })
        .catch(err => {
            showSnackbar({message: `删除失败。请确保类型 ${del?.type} 没有被任何房间使用。`, severity: "error"});
            handleClose();
        });
    };

    return (
        <BinaryDialog 
            open={del !== null} onConfirm={handleDelete} onClose={handleClose}
            title="删除房间类型" 
            content={`确定要删除房间类型 ${del?.type} 吗？`}
        />
    );
}

export default Types;