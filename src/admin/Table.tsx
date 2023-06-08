import * as React from "react";
import { 
    Typography, 
    Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Skeleton,
    Paper,
} from "@mui/material";
import TableSortLabel from '@mui/material/TableSortLabel';
import { getComparator } from "utils/util";
import { Order } from "utils/util";

interface TableProps {
    columns: {
        field: string;
        label: string;
        noSort?: boolean;
    }[];
    rows: Record<string, any>[];
    getValueLabel?: (row: Record<string, any>, field: string) => React.ReactNode; // default: row[field]
    compare?: (a: Record<string, any>, b: Record<string, any>, orderBy: string) => number;
    defaultOrder?: Order;
    defaultOrderBy?: string;
    
    height?: string;
    minWidth?: string;

    scrollTop?: boolean;
    scrollBottom?: boolean;
    setScrollTop?: React.Dispatch<React.SetStateAction<boolean>>;
    setScrollBottom?: React.Dispatch<React.SetStateAction<boolean>>;
}

function Table(props: TableProps) {
    const { columns, rows, compare, defaultOrder, defaultOrderBy } = props;
    const { height, minWidth } = props;
    const { scrollTop, scrollBottom, setScrollTop, setScrollBottom } = props;

    const [orderBy, setOrderBy] = React.useState(defaultOrderBy || columns[0].field);
    const [order, setOrder] = React.useState<Order>(defaultOrder || "asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);

    const topRef = React.useRef<HTMLTableRowElement|null>(null);
    const bottomRef = React.useRef<HTMLTableRowElement|null>(null);

    React.useEffect(() => {
        if (scrollTop) {
            if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth" });
            setScrollTop && setScrollTop(false);
        }
        if (scrollBottom) {
            if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
            setScrollBottom && setScrollBottom(false);
        }
    }, [scrollTop, scrollBottom, setScrollTop, setScrollBottom]);

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

            const comparator = getComparator(order, orderBy, compare);
            const sorted = [...rows].sort(comparator);
            setSorted(sorted);
        },
        [order, orderBy, rows, compare],
    );

    return (
        <Paper sx={{ my: 1, width: '100%', overflow: 'auto' }}>
            <TableContainer sx={{ height: height }}>
                <MuiTable stickyHeader size="small" sx={{ minWidth: minWidth }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((col, i) => (
                                col.noSort ?
                                <TableCell key={i}>
                                    <Typography fontWeight="bold">{col.label}
                                </Typography></TableCell> :
                                <HeadCell key={i} 
                                    field={col.field} label={col.label}
                                    onRequestSort={onRequestSort} orderBy={orderBy} order={order}
                                />
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sorted.map((row, i) => (
                            <TableRow key={i} ref={i === 0 ? topRef : i === sorted.length - 1 ? bottomRef : null}>
                                {columns.map((col, j) => (
                                    <TableCell key={j}>
                                        {props.getValueLabel ? props.getValueLabel(row, col.field) : row[col.field]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </MuiTable>
            </TableContainer>
        </Paper>
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
    height?: string;
    minWidth?: string;
}

export function TableSkeleton(props: TableSkeletonProps) {
    const { columns, rowCount, height, minWidth } = props;
    return (
        <Paper sx={{ my: 1, width: '100%', overflow: 'auto' }}>
            <TableContainer sx={{ height: height }}>
                <MuiTable stickyHeader size="small" sx={{ minWidth: minWidth }}>
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
        </Paper>
    );
}

export default Table;