import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import Table, { TableSkeleton } from "utils/Table";
import * as React from "react";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";

function Privacy() {
    const [resvPrivacy, setResvPrivacy] = React.useState<Record<string, any>[]|undefined>(undefined);

    React.useEffect(() => {
        fetch(api_paths.admin.resv_privacy)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setResvPrivacy(data))
            .catch(err => {
                console.error(err);
                setResvPrivacy([]);
            });
    }, []);

    const columns = [
        {field: "privacy", label: "隐私"},
        {field: "label", label: "标签"},
        {field: "actions", label: "操作", noSort: true},
    ];

    const renderValue = (row: Record<string, any>, field: string) => {
        switch (field) {
            case "label":
                return (
                    <Typography noWrap sx={{ maxWidth: "70px" }}>
                        {row[field]}
                    </Typography>
                );
            case "actions":
                return (
                    <Tooltip title="编辑">
                        <IconButton size="small"
                            component={Link} to={`/admin/reservations/privacy/edit/${row.privacy}`}>
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
                预订隐私
            </Typography>
            {resvPrivacy !== undefined && 
            <Table
                columns={columns}
                rows={resvPrivacy}
                minWidth="300px"
                getValueLabel={renderValue}
            />}
            {resvPrivacy === undefined && 
            <TableSkeleton 
                rowCount={3}
                columns={columns.map(column => column.label)}
                minWidth="300px"
            />}
        </Box>
    );
}

export default Privacy;