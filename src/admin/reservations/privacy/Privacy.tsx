import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import Table, { TableSkeleton } from "admin/Table";
import * as React from "react";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";

function Privacy() {
    const [resvPrivacy, setResvPrivacy] = React.useState<Record<string, any>[]|undefined>(undefined);

    React.useEffect(() => {
        fetch(api_paths.admin.resv_privacy)
            .then(res => res.json())
            .then(data => {
                setResvPrivacy(data);
            });
    }, []);

    const columns = [
        {field: "privacy", label: "隐私"},
        {field: "label", label: "标签"},
        {field: "actions", label: "操作", noSort: true},
    ];

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
                getValueLabel={(row, field) => {
                    if (field === "label") {
                        return (
                            <Typography variant="inherit" noWrap sx={{ maxWidth: "70px" }}>
                                {row[field]}
                            </Typography>
                        );
                    } else if (field === "actions") {
                        return (
                            <Tooltip title="编辑">
                                <IconButton size="small"
                                    component={Link} to={`/admin/reservations/privacy/edit?privacy=${row.privacy}`}>
                                    <EditIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        );
                    } else {
                        return row[field];
                    }
                }}
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