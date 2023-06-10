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

function Roles() {
    const [userRoles, setUserRoles] = React.useState<Record<string, any>[]|undefined>(undefined);

    React.useEffect(() => {
        fetch(api_paths.admin.user_roles)
            .then(res => res.json())
            .then(data => {
                setUserRoles(data);
            })
            .catch(err => {
                console.error(err);
                setUserRoles([]);
            });
    }, []);

    const columns = [
        { field: "role", label: "角色" },
        { field: "label", label: "标签" },
        { field: "actions", label: "操作", noSort: true },
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
                            component={Link} to={`/admin/users/roles/edit/${row.role}`}>
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
                用户角色
            </Typography>
            {userRoles !== undefined &&
            <Table
                columns={columns}
                rows={userRoles}
                minWidth="300px"
                getValueLabel={renderValue}
            />}
            {userRoles === undefined &&
            <TableSkeleton
                rowCount={6}
                columns={columns.map(column => column.label)}
                minWidth="300px"
            />}
        </Box>
    );
}

export default Roles;