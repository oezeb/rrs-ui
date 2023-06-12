import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import * as React from "react";

import Table, { TableSkeleton } from "utils/Table";
import { roomStatusColors as statusColors } from 'utils/util';
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";

function Status() {
    const [roomStatus, setRoomStatus] = React.useState<Record<string, any>[]|undefined>(undefined);

    React.useEffect(() => {
        fetch(api_paths.admin.room_status)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setRoomStatus(data))
            .catch(err => {
                console.error(err);
                setRoomStatus([]);
            });
    }, []);

    const columns = [
        {field: "status", label: "状态"},
        {field: "label", label: "标签"},
        {field: "actions", label: "操作", noSort: true},
    ];

    const renderValue = (row: Record<string, any>, field: string) => {
        switch (field) {
            case "label":
                return (
                    <Typography noWrap sx={{ maxWidth: "70px" }}>
                        <Box component="span"
                            borderBottom={3} 
                            borderColor={statusColors[row.status]}
                        >
                            {row[field]}
                        </Box>
                    </Typography>
                );
            case "actions":
                return (
                    <Tooltip title="编辑">
                        <IconButton size="small"
                            component={Link} to={`/admin/rooms/status/edit/${row.status}`}>
                            <EditIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                );
            default:
                return row[field];
        }
    };

    return(
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                房间状态
            </Typography>
            {roomStatus !== undefined && 
            <Table
                columns={columns}
                rows={roomStatus}
                minWidth="300px"
                getValueLabel={renderValue}
            />}
            {roomStatus === undefined &&
            <TableSkeleton
                rowCount={2}
                columns={columns.map(column => column.label)}
                minWidth="300px"
            />}
        </Box>
    );
}

export default Status;