import * as React from "react";
import { 
    Box,  
    Typography, 
    Button,
    IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Paper,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TableSortLabel from '@mui/material/TableSortLabel';

import { Link } from "../../../Navigate";
import { useSnackbar } from "../../../SnackbarProvider";
import BinaryDialog from "../../../BinaryDialog";
import { getComparator } from "../../../util";
import { paths as api_paths } from "../../../api";
import { TableSkeleton } from "../../Table";

function Types() {
    const [roomTypes, setRoomTypes] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [del, setDel] = React.useState<Record<string, any>|null>(null);
    const [orderBy, setOrderBy] = React.useState<string>("type");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        fetch(api_paths.admin.room_types)
            .then(res => res.json())
            .then(data => {
                setRoomTypes(data);
            });
    }, []);

    React.useEffect(() => {
        if (roomTypes === undefined) return;
        const comparator = getComparator(order, orderBy);
        const sorted = [...roomTypes].sort(comparator);
        setSorted(sorted);
    }, [roomTypes, order, orderBy]);

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            if (roomTypes === undefined) return;
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
                ><Typography fontWeight="bold">
                    {props.label}
                </Typography></TableSortLabel>
            </TableCell>
        );
    };

    const columns = [
        {field: "type", label: "类型"},
        {field: "label", label: "标签"},
        {field: "action", label: "操作", noSort: true}
    ];

    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                房间类型
            </Typography>
            {roomTypes === undefined &&
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden', height: "70vh"}}>
                <TableSkeleton rowCount={15} columns={columns.map(column => column.label)} />
            </Paper>}
            {roomTypes !== undefined &&
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ minWidth: 600, height: "70vh"}}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <SortHeadCell field="type" label="类型" />
                                <SortHeadCell field="label" label="标签" />
                                <TableCell><Typography fontWeight="bold">操作</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sorted.map((roomType: Record<string, any>, i) => (
                                <TableRow key={i}>
                                    <TableCell>{roomType.type}</TableCell>
                                    <TableCell>{roomType.label}</TableCell>
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
            </Paper>}
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
    setRoomTypes: React.Dispatch<React.SetStateAction<Record<string, any>[]|undefined>>;
}

const DeleteDialog = ({ del, setDel, setRoomTypes }: DeleteDialogProps) => {
    const { showSnackbar } = useSnackbar();
    
    const handleClose = () => {
        setDel(null);
    };

    const handleDelete = () => {
        fetch(api_paths.admin.room_types + `/${del?.type}`, { 
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
        })
            .then(res => {
                if (res.ok) {
                    showSnackbar({message: "删除成功", severity: "success", duration: 2000});
                    setRoomTypes(old => {
                        console.log(old);
                        return old?.filter(roomType => roomType.type !== del?.type);
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