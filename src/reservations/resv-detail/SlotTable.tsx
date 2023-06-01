import HelpIcon from '@mui/icons-material/Help';
import {
    Box,
    Skeleton,
    Table, TableBody, TableCell,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material";
import Chip from '@mui/material/Chip';
import { Dayjs } from 'dayjs';
import React from "react";

import { paths as api_paths, resv_status } from "utils/api";
import { resvStatusColors } from 'utils/util';

interface SlotTableProps {
    resv?: Record<string, any>|null;
    onCancel: (slot_id?: number) => void;
}


function SlotTable(props: SlotTableProps) {
    const { resv, onCancel } = props;
    const [status, setStatus] = React.useState<Record<number, any>>({});

    React.useEffect(() => {
        fetch(api_paths.resv_status)
            .then(res => res.json())
            .then(data => {
                setStatus(data.reduce((acc: Record<number, any>, item: any) => {
                    acc[item.status] = item;
                    return acc;
                }, {}));
            });
    }, []);
    
    const formatTime = (time: Dayjs) => {
        return time.format("YYYY-MM-DD HH:mm");
    }

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>时间编号</TableCell>
                    <TableCell>开始时间</TableCell>
                    <TableCell>结束时间</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>操作
                        {resv && resv.time_slots.length > 1 && resv.time_slots.some((slot: any) => (
                            slot.status === resv_status.pending || slot.status === resv_status.confirmed
                            )) &&
                        <Chip
                            label="全部取消"
                            size="small"
                            color="error"
                            sx={{ ml: 1 }}
                            onClick={() => onCancel()}
                            onDelete={() => onCancel()}
                        />}
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {resv ? resv.time_slots.map((slot: any) => (
                    <TableRow key={slot.slot_id}>
                        <TableCell>{slot.slot_id}</TableCell>
                        <TableCell>{formatTime(slot.start_time)}</TableCell>
                        <TableCell>{formatTime(slot.end_time)}</TableCell>
                        <TableCell>
                            {slot.status !== undefined ? (
                                <Box display="flex" alignItems="center">
                                    <Box display="inline"
                                        borderBottom={3}
                                        borderColor={resvStatusColors[slot.status]}
                                    >
                                        {status[slot.status]?.label ?? slot.status}
                                    </Box>
                                    {status[slot.status]?.description &&
                                    <Tooltip title={status[slot.status]?.description}>
                                        <HelpIcon fontSize="small" sx={{ ml: 1 }} />
                                    </Tooltip>}
                                </Box>
                            ) : <Skeleton />}
                        </TableCell>
                        <TableCell>
                            {slot.status === resv_status.pending || slot.status === resv_status.confirmed ? (
                                <Chip
                                    label="取消"
                                    size="small"
                                    color="error"
                                    onClick={() => onCancel(slot.slot_id)}
                                    onDelete={() => onCancel(slot.slot_id)}
                                />
                            ) : null}
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5}>
                            <Skeleton />
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

export default SlotTable;