import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
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
import { useState } from "react";

interface SlotTableProps {
    title?: string;
    slots: Record<string, any>[];

    action?: (slot: Record<string, any>, index: number) => React.ReactNode;
}

const SlotTable = ({ title, slots, action }: SlotTableProps) => {
    const [open, setOpen] = useState(true);
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
                            {action && <TableCell>操作</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {slots.map((slot, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{slot.start_time.format("YYYY-MM-DD HH:mm")}</TableCell>
                                <TableCell>{slot.end_time.format("YYYY-MM-DD HH:mm")}</TableCell>
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