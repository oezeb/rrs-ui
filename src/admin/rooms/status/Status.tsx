import * as React from "react";
import { 
    Box,  
    Typography,
    IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';

import { statusColors } from "../../../rooms/RoomDetails";
import { Link } from "../../../Navigate";


function Status() {
    const [roomStatus, setRoomStatus] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        fetch("/api/admin/room_status")
            .then(res => res.json())
            .then(data => {
                setRoomStatus(data);
            });
    }, []);

    return (
        <RoomStatusView roomStatus={roomStatus} />
    );
}

export function RoomStatusView({roomStatus}: {roomStatus: Record<string, any>[]}) {
    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                房间状态
            </Typography>
            <TableContainer sx={{minWidth: 600}}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>状态</TableCell>
                            <TableCell>标签</TableCell>
                            <TableCell>说明</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.values(roomStatus).map((roomStatus: Record<string, any>, i) => (
                            <TableRow key={i}>
                                <TableCell>{roomStatus.status}</TableCell>
                                <TableCell>
                                    <Box display="inline" 
                                        borderBottom={3} 
                                        borderColor={statusColors[roomStatus.status]}
                                    >
                                        {roomStatus.label}
                                    </Box>
                                </TableCell>
                                <TableCell>{roomStatus.description?? "无"}</TableCell>
                                <TableCell>
                                    <Tooltip title="编辑">
                                        <IconButton size="small" 
                                            component={Link} to={`/admin/rooms/status/edit?status=${roomStatus.status}`}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default Status;