import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    IconButton,
    Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
    Typography,
} from "@mui/material";
import TableSortLabel from '@mui/material/TableSortLabel';
import * as React from "react";

import { TableSkeleton } from "admin/Table";
import { roomStatusColors as statusColors } from 'utils/util';
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { getComparator } from "utils/util";

function Status() {
    const [roomStatus, setRoomStatus] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [orderBy, setOrderBy] = React.useState<string>("type");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        fetch(api_paths.admin.room_status)
            .then(res => res.json())
            .then(data => setRoomStatus(data));
    }, []);

    React.useEffect(() => {
        if (roomStatus === undefined) return;
        const comparator = getComparator(order, orderBy);
        const sorted = [...roomStatus].sort(comparator);
        setSorted(sorted);
    }, [roomStatus, order, orderBy]);

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            if (roomStatus === undefined) return;
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
                ><Typography fontWeight="bold">
                    {props.label}
                </Typography></TableSortLabel>
            </TableCell>
        );
    };

    const columns = [
        {field: "status", label: "状态"},
        {field: "label", label: "标签"},
        {field: "actions", label: "操作", noSort: true},
    ];

    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                房间状态
            </Typography>
            {roomStatus === undefined &&
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden', height: "70vh"}}>
                <TableSkeleton rowCount={15} columns={columns.map(column => column.label)} />
            </Paper>}
            {roomStatus !== undefined && 
            <TableContainer component={Paper} sx={{minWidth: 600}}>
                <Table size="small">
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
                        {sorted.map((status: Record<string, any>, i) => (
                            <TableRow key={i}>
                                <TableCell>{status.status}</TableCell>
                                <TableCell>
                                    <Box display="inline" 
                                        borderBottom={3} 
                                        borderColor={statusColors[status.status]}
                                    >
                                        {status.label}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="编辑">
                                        <IconButton size="small" 
                                            component={Link} to={`/admin/rooms/status/edit?status=${status.status}`}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>}
        </Box>
    );
}

export default Status;