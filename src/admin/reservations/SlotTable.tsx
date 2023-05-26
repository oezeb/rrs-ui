import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    ListItemText,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    List,
    Collapse,
    ListItemIcon,
    ListItemButton,
    IconButton,
} from "@mui/material";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';

import { paths as api_paths } from "utils/api";
import { statusColors as resvStatusColors } from "user/reservation/Reservations"

interface SlotTableProps {
    title?: string;
    slots: Record<string, any>[];
}

const SlotTable = ({ title, slots }: SlotTableProps) => {
    const [status, setStatus] = useState<Record<string, any>>({});
    const [open, setOpen] = useState(true);

    useEffect(() => {
        fetch(api_paths.resv_status)
            .then(res => res.json())
            .then(data => setStatus(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                acc[cur.status] = cur;
                return acc;
            }, {})));
    }, []);

    return (
        <List>
            <ListItemButton divider={!open} onClick={() => setOpen(!open)}>
                <ListItemText primary={title || "已选时段"} />
                <ListItemIcon>
                    {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemIcon>
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>编号</TableCell>
                            <TableCell>开始时间</TableCell>
                            <TableCell>结束时间</TableCell>
                            <TableCell>状态</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {slots.map((slot, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{slot.start_time.format("YYYY-MM-DD HH:mm")}</TableCell>
                                <TableCell>{slot.end_time.format("YYYY-MM-DD HH:mm")}</TableCell>
                                <TableCell>
                                    <Box display="inline"
                                        borderBottom={3}
                                        borderColor={resvStatusColors[slot.status]}
                                    >
                                        {status[slot.status]?.label}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small">
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {slots.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography variant="body2" color="text.secondary" align="center">
                                        无
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Collapse>
        </List>
    );
}

export default SlotTable;