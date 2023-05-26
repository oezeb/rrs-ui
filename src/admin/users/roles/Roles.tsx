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
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { getComparator } from "utils/util";

function Roles() {
    const [userRoles, setUserRoles] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [orderBy, setOrderBy] = React.useState<string>("role");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        fetch(api_paths.admin.user_roles)
            .then(res => res.json())
            .then(data => {
                setUserRoles(data);
            })
            .catch(err => {
                console.error(err);
                setUserRoles([]);
            });
    }, []);

    React.useEffect(() => {
        if (userRoles === undefined) return;
        const comparator = getComparator(order, orderBy);
        const sorted = [...userRoles].sort(comparator);
        setSorted(sorted);
    }, [userRoles, order, orderBy]);

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            if (userRoles === undefined) return;
            const isAsc = orderBy === property && order === "asc";
            setOrder(isAsc ? "desc" : "asc");
            setOrderBy(property);

            const comparator = getComparator(order, orderBy);
            const sorted = [...userRoles].sort(comparator);
            setSorted(sorted);
        },
        [orderBy, order, userRoles],
    );

    const SortHeadCell = (props: {field: string, label: string}) => (
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

    const columns = [
        { field: "role", label: "角色" },
        { field: "label", label: "标签" },
        { field: "actions", label: "操作", noSort: true },
    ];

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                用户角色
            </Typography>
            {userRoles === undefined &&
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden', height: "70vh"}}>
                <TableSkeleton rowCount={15} columns={columns.map(column => column.label)} />
            </Paper>}
            {userRoles !== undefined &&
            <TableContainer component={Paper}>
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
                        {sorted.map((row, i) => (
                            <TableRow key={i}>
                                <TableCell>{row.role}</TableCell>
                                <TableCell>{row.label}</TableCell>
                                <TableCell>
                                    <Tooltip title="编辑">
                                        <IconButton size="small"
                                            component={Link} to={`/admin/users/roles/edit?role=${row.role}`}>
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

export default Roles;