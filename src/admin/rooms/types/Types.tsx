import * as React from "react";
import { 
    Box,  
    Typography, 
    Button,
    IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TableSortLabel from '@mui/material/TableSortLabel';

import { Link } from "../../../Navigate";
import { useSnackbar } from "../../../SnackbarProvider";
import BinaryDialog from "../../../BinaryDialog";
import { getComparator } from "../../../util";

function Types() {
    const [roomTypes, setRoomTypes] = React.useState<Record<string, any>[]>([]);
    const [del, setDel] = React.useState<Record<string, any>|null>(null);
    const [orderBy, setOrderBy] = React.useState<string>("type");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        fetch("/api/admin/room_types")
            .then(res => res.json())
            .then(data => {
                setRoomTypes(data);
            });
    }, []);

    React.useEffect(() => {
        const comparator = getComparator(order, orderBy);
        const sorted = [...roomTypes].sort(comparator);
        setSorted(sorted);
    }, [roomTypes, order, orderBy]);

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            const isAsc = orderBy === property && order === "asc";
            setOrder(isAsc ? "desc" : "asc");
            setOrderBy(property);

            const comparator = getComparator(order, orderBy);
            const sorted = [...roomTypes].sort(comparator);
            setSorted(sorted);
        },
        [orderBy, order, roomTypes]
    );

    const SortHeadCell = (props: {field: string, label: string}) => {
        return (
            <TableCell sortDirection={orderBy === props.field ? order : false}>
                <TableSortLabel
                    active={orderBy === props.field}
                    direction={orderBy === props.field ? order : "asc"}
                    onClick={(e) => { handleRequestSort(e, props.field); }}
                >{props.label}</TableSortLabel>
            </TableCell>
        );
    };


    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                房间类型
            </Typography>
            <TableContainer sx={{minWidth: 600}}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <SortHeadCell field="type" label="类型" />
                            <SortHeadCell field="label" label="标签" />
                            <TableCell>说明</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sorted.map((roomType: Record<string, any>, i) => (
                            <TableRow key={i}>
                                <TableCell>{roomType.type}</TableCell>
                                <TableCell
                                    sx={{
                                        maxWidth: 150, 
                                        overflow: "hidden", textOverflow: "ellipsis", 
                                        whiteSpace: "nowrap"
                                    }}
                                >{roomType.label}</TableCell>
                                <TableCell
                                    sx={{
                                        maxWidth: 150,
                                        overflow: "hidden", textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}
                                >{roomType.description?? "无"}</TableCell>
                                <TableCell>
                                    <Tooltip title="删除">
                                        <IconButton size="small" onClick={() => setDel(roomType)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="编辑">
                                        <IconButton size="small"
                                            component={Link} to={`/admin/rooms/types/edit?type=${roomType.type}`}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>    
            <Box display="flex" justifyContent="flex-end" pt={2}>
                <Button fullWidth variant="text" color="primary" startIcon={<AddIcon />}
                    component={Link} to="/admin/rooms/types/add">
                    添加类型
                </Button>
            </Box>
            <DeleteDialog del={del} setDel={setDel} setRoomTypes={setRoomTypes} />
        </Box>
    );
}

interface DeleteDialogProps {
    del: Record<string, any>|null;
    setDel: (del: Record<string, any>|null) => void;
    setRoomTypes: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
}

const DeleteDialog = ({ del, setDel, setRoomTypes }: DeleteDialogProps) => {
    const { showSnackbar } = useSnackbar();
    
    const handleClose = () => {
        setDel(null);
    };

    const handleDelete = () => {
        fetch('/api/admin/room_types', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{type: del?.type}])
        })
        .then(res => {
            if (res.ok) {
                showSnackbar({message: "删除成功", severity: "success", duration: 2000});
                setRoomTypes(old => {
                    console.log(old);
                    return old.filter(roomType => roomType.type !== del?.type);
                });
                handleClose();
            } else {
                throw new Error("删除失败");
            }
        })
        .catch(err => {
            showSnackbar({message: `删除失败。请确保类型 ${del?.type} 没有被任何房间使用。`, severity: "error"});
            handleClose();
        });
    };

    return (
        <BinaryDialog 
            open={del !== null} onConfirm={handleDelete} onClose={handleClose}
            title="删除房间类型" 
            content={`确定要删除房间类型 ${del?.type} 吗？`}
        />
    );
}

export default Types;