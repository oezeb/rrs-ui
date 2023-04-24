import * as React from "react";
import { 
    Box,  
    Typography,
    IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import TableSortLabel from '@mui/material/TableSortLabel';

import { statusColors } from "../../../rooms/RoomDetails";
import { Link } from "../../../Navigate";
import { getComparator } from "../../../util";


function Status() {
    const [roomStatus, setRoomStatus] = React.useState<Record<string, any>[]>([]);
    const [orderBy, setOrderBy] = React.useState<string>("type");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        fetch("/api/admin/room_status")
            .then(res => res.json())
            .then(data => {
                setRoomStatus(data);
            });
    }, []);

    React.useEffect(() => {
        const comparator = getComparator(order, orderBy);
        const sorted = [...roomStatus].sort(comparator);
        setSorted(sorted);
    }, [roomStatus, order, orderBy]);

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            const isAsc = orderBy === property && order === "asc";
            setOrder(isAsc ? "desc" : "asc");
            setOrderBy(property);

            const comparator = getComparator(order, orderBy);
            const sorted = [...roomStatus].sort(comparator);
            setSorted(sorted);
        },
        [orderBy, order, roomStatus]
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
                房间状态
            </Typography>
            <TableContainer sx={{minWidth: 600}}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <SortHeadCell field="status" label="状态" />
                            <SortHeadCell field="label" label="标签" />
                            <TableCell>说明</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sorted.map((roomStatus: Record<string, any>, i) => (
                            <TableRow key={i}>
                                <TableCell>{roomStatus.status}</TableCell>
                                <TableCell
                                    sx={{
                                        maxWidth: 150,
                                        overflow: "hidden", textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    <Box display="inline" 
                                        borderBottom={3} 
                                        borderColor={statusColors[roomStatus.status]}
                                    >
                                        {roomStatus.label}
                                    </Box>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        maxWidth: 150,
                                        overflow: "hidden", textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}
                                >{roomStatus.description?? "无"}</TableCell>
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