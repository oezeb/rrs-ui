import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import Table, { TableSkeleton } from "utils/Table";
import * as React from "react";
import { resvStatusColors as statusColors } from 'utils/util';
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";

function Status() {
    const [resvStatus, setResvStatus] = React.useState<Record<string, any>[]|undefined>(undefined);

    React.useEffect(() => {
        fetch(api_paths.admin.resv_status)
            .then(res => res.json())
            .then(data => {
                setResvStatus(data);
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
                            component={Link} to={`/admin/reservations/status/edit/${row.status}`}>
                            <EditIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                );
            default:
                return row[field];
        }
    };
    
    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                预订状态
            </Typography>
            {resvStatus !== undefined && 
            <Table
                columns={columns}
                rows={resvStatus}
                minWidth='300px'
                getValueLabel={renderValue}
            />}
            {resvStatus === undefined && 
            <TableSkeleton
                rowCount={4}
                columns={columns.map(column => column.label)}
                minWidth="300px"
            />}
        </Box>
    );
}

export default Status;