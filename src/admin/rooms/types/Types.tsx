import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import * as React from "react";

import Table, { TableSkeleton } from "utils/Table";
import { useSnackbar } from "providers/SnackbarProvider";
import BinaryDialog from "utils/BinaryDialog";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";

function Types() {
    const [roomTypes, setRoomTypes] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [del, setDel] = React.useState<Record<string, any>|null>(null);

    React.useEffect(() => {
        fetch(api_paths.admin.room_types)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setRoomTypes(data))
            .catch(err => {
                console.error(err);
                setRoomTypes([]);
            });
    }, []);

    const columns = [
        {field: "type", label: "类型"},
        {field: "label", label: "标签"},
        {field: "action", label: "操作", noSort: true}
    ];

    const renderValue = (row: Record<string, any>, field: string) => {
        switch (field) {
            case "label":
                return (
                    <Typography noWrap sx={{ maxWidth: "70px" }}>
                        {row[field]}
                    </Typography>
                );
            case "action":
                return (<>
                    <Tooltip title="删除">
                        <IconButton size="small" onClick={() => setDel(row)}>
                            <DeleteIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="编辑">
                        <IconButton size="small"
                            component={Link} to={`/admin/rooms/types/edit/${row.type}`}
                        >
                            <EditIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                </>);
            default:
                return row[field];
        }
    };

    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                房间类型
            </Typography>
            {roomTypes !== undefined && 
            <Table
                columns={columns}
                rows={roomTypes}
                height="70vh"
                minWidth="300px"
                getValueLabel={renderValue}
            />}
            {roomTypes === undefined &&
            <TableSkeleton
                rowCount={14}
                columns={columns.map(column => column.label)}
                height="70vh"
                minWidth="300px"
            />}
            <Button fullWidth variant="text" color="primary" startIcon={<AddIcon />}
                component={Link} to="/admin/rooms/types/add">
                添加类型
            </Button>
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