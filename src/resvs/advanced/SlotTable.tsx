import { useState } from "react";
import {
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

interface SlotTableProps {
    title?: string;
    slots: Record<string, any>[];
}

const SlotTable = ({ title, slots }: SlotTableProps) => {
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
                                    <IconButton size="small">
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                </TableCell>
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