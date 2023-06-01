import * as React from "react";
import { 
    Box,  
    Typography,
    Button,
    IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
    Skeleton,
    Paper,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { time } from "utils/util";

interface PeriodTableProps {
    periods: Record<string, any>[]|undefined;
    setPeriods: React.Dispatch<React.SetStateAction<Record<string, any>[]|undefined>>;

    setDel: React.Dispatch<React.SetStateAction<Record<string, any>|undefined>>;
}

function PeriodTable({ periods, setPeriods, setDel }: PeriodTableProps) {
    const lastRow = React.useRef<HTMLTableRowElement|null>(null);

    const handleAdd = () => {
        if (periods === undefined) return;
        setPeriods([...periods, {
            start_time: null,
            end_time: null,
        }]);
        setTimeout(() => {
            if (lastRow.current) lastRow.current.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const HeadCell = ({ children, ...props }: any) => (
        <TableCell {...props}>
            <Typography fontWeight="bold">{children}</Typography>
        </TableCell>
    );

    return (<>
        <Paper sx={{ my: 1, width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ height: "60vh"}}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <HeadCell>编号</HeadCell>
                            <HeadCell>开始时间</HeadCell>
                            <TableCell />
                            <HeadCell>结束时间</HeadCell>
                            <HeadCell>操作</HeadCell>
                        </TableRow>
                    </TableHead>
                    {periods === undefined && <TableBodySkeleton />}
                    {periods !== undefined && 
                    <TableBody>
                        {periods.map((p, i) =>(
                            <TableRow key={i} ref={i === periods.length - 1 ? lastRow : null}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>
                                    <TextField required size="small" type="time" variant="standard"
                                        id="start_time"
                                        value={p.start_time?.format("HH:mm")??''}
                                        onChange={e => setPeriods(periods.map((p, j) => i !== j ? p : { 
                                            ...p, 
                                            start_time: time(e.target.value)
                                        }))}
                                    />
                                </TableCell>
                                <TableCell align="center">~</TableCell>
                                <TableCell>
                                    <TextField required size="small" type="time" variant="standard"
                                        id="end_time"
                                        value={p.end_time?.format("HH:mm")??''}
                                        onChange={e => setPeriods(periods.map((p, j) => i !== j ? p : { 
                                            ...p, 
                                            end_time: time(e.target.value)
                                        }))}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="删除">
                                        <IconButton size="small"
                                            onClick={() => p.period_id ? setDel(p) : setPeriods(periods.filter((_, j) => i !== j))}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>}
                </Table>
            </TableContainer>
        </Paper>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button size="small" fullWidth
                startIcon={<AddIcon />}
                onClick={handleAdd}
            >
                添加时间段
            </Button>
        </Box>
    </>);
}

const TableBodySkeleton = () => (
    <TableBody>
        {Array(12).fill(0).map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell align="center">~</TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
            </TableRow>
        ))}
    </TableBody>
);

export default PeriodTable;