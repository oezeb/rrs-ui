import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    IconButton,
    Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
    Typography,
} from "@mui/material";
import TableSortLabel from '@mui/material/TableSortLabel';
import { TableSkeleton } from "admin/Table";
import * as React from "react";
import { statusColors } from "user/reservation/Reservations";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { getComparator } from "utils/util";

function Status() {
    const [resvStatus, setResvStatus] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [orderBy, setOrderBy] = React.useState<string>("status");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        fetch(api_paths.admin.resv_status)
            .then(res => res.json())
            .then(data => {
                setResvStatus(data);
            });
    }, []);

    React.useEffect(() => {
        if (resvStatus === undefined) return;
        const comparator = getComparator(order, orderBy);
        const sorted = [...resvStatus].sort(comparator);
        setSorted(sorted);
    }, [resvStatus, order, orderBy]);

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            if (resvStatus === undefined) return;
            const isAsc = orderBy === property && order === "asc";
            setOrder(isAsc ? "desc" : "asc");
            setOrderBy(property);

            const comparator = getComparator(order, orderBy);
            const sorted = [...resvStatus].sort(comparator);
            setSorted(sorted);
        }
        , [orderBy, order, resvStatus]
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
    
    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                预订状态
            </Typography>
            {resvStatus === undefined && <TableSkeleton rowCount={4} columns={['状态', '标签', '操作']} />}
            {resvStatus !== undefined && 
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <SortHeadCell field="status" label="状态" />
                            <SortHeadCell field="label" label="标签" />
                            <TableCell><Typography fontWeight="bold">操作</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sorted.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.status}</TableCell>
                                <TableCell>
                                    <Box display="inline" 
                                        borderBottom={3} 
                                        borderColor={statusColors[row.status]}
                                        >{row.label}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="编辑">
                                        <IconButton component={Link} to={`/admin/reservations/status/edit?status=${row.status}`} size="small">
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