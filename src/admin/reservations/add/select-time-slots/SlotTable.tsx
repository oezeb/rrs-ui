import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
    Box,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { paths as api_paths} from 'utils/api';
import { resvStatusColors as statusColors } from 'utils/util';

interface SlotTableProps {
    title: string;
    slots: Record<string, any>[];

    action?: (slot: Record<string, any>, index: number) => React.ReactNode;
}

const SlotTable = ({ title, slots, action }: SlotTableProps) => {
    const [resvStatus, setResvStatus] = useState<Record<string, any>>({});
    const [open, setOpen] = useState(true);

    useEffect(() => {
        fetch(api_paths.admin.resv_status)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setResvStatus(data
                .reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.status] = cur;
                    return acc;
                }, {})
            ))
            .catch(err => console.log(err));
    }, []);

    return (
        <List>
            <ListItemButton divider={!open} onClick={() => setOpen(!open)}>
                <ListItemText primary={title} />
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
                            <TableCell>预订状态</TableCell>
                            {action && <TableCell>操作</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {slots.map((slot, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{slot.start_time.format("YYYY-MM-DD HH:mm")}</TableCell>
                                <TableCell>{slot.end_time.format("YYYY-MM-DD HH:mm")}</TableCell>
                                <TableCell>
                                    {slot.status !== undefined &&
                                    <Box component="span" 
                                        borderBottom={3} 
                                        borderColor={statusColors[slot.status]}
                                    >
                                        {resvStatus[slot.status]?.label}
                                    </Box>}
                                </TableCell>
                                {action && <TableCell>{action(slot, index)}</TableCell>}
                            </TableRow>
                        ))}
                        {slots.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4}>
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