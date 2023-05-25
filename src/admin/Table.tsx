import * as React from "react";
import { 
    Typography, 
    Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Skeleton,
} from "@mui/material";
import TableSortLabel from '@mui/material/TableSortLabel';
import { getComparator } from "../util";
import { Order } from "../util";

interface TableProps {
    columns: {
        field: string;
        label: string;
        sortable?: boolean;
    }[];
    rows: Record<string, any>[];
    getValueLabel?: (row: Record<string, any>, field: string) => React.ReactNode; // default: row[field]
    actions?: React.ReactNode[];
    compare?: (a: Record<string, any>, b: Record<string, any>, orderBy: string) => number;
    defaultOrder?: Order;
    defaultOrderBy?: string;
}

function Table(props: TableProps) {
    const { columns, rows, actions, compare, defaultOrder, defaultOrderBy } = props;
    const [orderBy, setOrderBy] = React.useState(defaultOrderBy || columns[0].field);
    const [order, setOrder] = React.useState<Order>(defaultOrder || "asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        const comparator = getComparator(order, orderBy, compare);
        const sorted = [...rows].sort(comparator);
        setSorted(sorted);
    }, [rows, order, orderBy, compare]);

    const onRequestSort = React.useCallback(
        (_: React.MouseEvent<unknown>, property: string) => {
            const isAsc = orderBy === property && order === 'asc';
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(property);

            const comparator = getComparator(order, orderBy);
            const sorted = [...rows].sort(comparator);
            setSorted(sorted);
        },
        [order, orderBy, rows],
    );

    return (
        <TableContainer>
            <MuiTable size="small">
                <TableHead>
                    <TableRow>
                        {columns.map((col, i) => (
                            col.sortable ?
                            <HeadCell key={i} 
                                field={col.field} label={col.label}
                                onRequestSort={onRequestSort} orderBy={orderBy} order={order}
                            /> :
                            <TableCell key={i}>
                                <Typography fontWeight="bold">{col.label}
                            </Typography></TableCell>
                        ))}
                        <TableCell><Typography fontWeight="bold">操作</Typography></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sorted.map((row, i) => (
                        <TableRow key={i}>
                            {columns.map((col, j) => (
                                <TableCell key={j}>
                                    {props.getValueLabel ? props.getValueLabel(row, col.field) : row[col.field]}
                                </TableCell>
                            ))}
                            <TableCell>{actions}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </MuiTable>
        </TableContainer>
    );
}

interface HeadCellProps {
    field: string;
    label: string;

    onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
    orderBy: string;
    order: Order;
}

export const HeadCell = (props: HeadCellProps) => {
    const { field, label, onRequestSort, orderBy, order } = props;
    return (
        <TableCell sortDirection={orderBy === field ? order : false}>
            <TableSortLabel
                active={orderBy === field}
                direction={orderBy === field ? order : "asc"}
                onClick={(e) => { onRequestSort(e, field); }}
            ><Typography fontWeight="bold">
                {label}
            </Typography>
            </TableSortLabel>
        </TableCell>
    );
};

interface TableSkeletonProps {
    columns: string[];
    rowCount: number;
}

export function TableSkeleton(props: TableSkeletonProps) {
    const { columns, rowCount } = props;
    return (
        <TableContainer>
            <MuiTable size="small">
                <TableHead>
                    <TableRow>
                        {columns.map((col, i) => (
                            <TableCell key={i}>
                                <Typography fontWeight="bold">{col}
                            </Typography></TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array(rowCount).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            {columns.map((col, j) => (
                                <TableCell key={j}>
                                    <Skeleton />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </MuiTable>
        </TableContainer>
    );
}

export default Table;