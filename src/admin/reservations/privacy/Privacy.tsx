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

function Privacy() {
    const [resvPrivacy, setResvPrivacy] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [orderBy, setOrderBy] = React.useState<string>("privacy");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        fetch(api_paths.admin.resv_privacy)
            .then(res => res.json())
            .then(data => {
                setResvPrivacy(data);
            });
    }, []);

    React.useEffect(() => {
        if (resvPrivacy === undefined) return;
        const comparator = getComparator(order, orderBy);
        const sorted = [...resvPrivacy].sort(comparator);
        setSorted(sorted);
    }, [resvPrivacy, order, orderBy]);

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            if (resvPrivacy === undefined) return;
            const isAsc = orderBy === property && order === "asc";
            setOrder(isAsc ? "desc" : "asc");
            setOrderBy(property);

            const comparator = getComparator(order, orderBy);
            const sorted = [...resvPrivacy].sort(comparator);
            setSorted(sorted);
        }
        , [orderBy, order, resvPrivacy]
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
                预订隐私
            </Typography>
            {resvPrivacy === undefined && <TableSkeleton rowCount={3} columns={['隐私设置', '标签', '操作']} />}
            {resvPrivacy !== undefined &&
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <SortHeadCell field="privacy" label="隐私" />
                            <SortHeadCell field="label" label="标签" />
                            <TableCell><Typography fontWeight="bold">操作</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sorted.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.privacy}</TableCell>
                                <TableCell
                                    sx={{
                                        maxWidth: 150,
                                        overflow: "hidden", textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}
                                >{row.label}</TableCell>
                                <TableCell>
                                    <Tooltip title="编辑">
                                        <IconButton component={Link} to={`/admin/reservations/privacy/edit?privacy=${row.privacy}`} size="small">
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

export default Privacy;