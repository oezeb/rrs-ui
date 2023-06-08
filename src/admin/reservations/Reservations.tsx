import AddIcon from '@mui/icons-material/Add';
import {
    Box,
    Button,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import * as React from "react";

import EditIcon from '@mui/icons-material/Edit';

import { resvStatusColors as statusColors } from 'utils/util';
import { TimeView } from 'reservations/Reservations';
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { descComp } from "utils/util";
import Table, { TableSkeleton } from "../Table";
import Privacy from "./privacy/Privacy";
import Status from "./status/Status";
import { TimeFilter, compareTimeSlot, selectTimeSlot } from 'utils/util';
import FilterView from 'reservations/resv-list/FilterView';

function Reservations() {
    const [reservations, setReservations] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [resvStatus, setResvStatus] = React.useState<Record<string, any>>({});
    const [resvPrivacy, setResvPrivacy] = React.useState<Record<string, any>>({});
    const [users, setUsers] = React.useState<Record<string, any>>({});
    const [rooms, setRooms] = React.useState<Record<string, any>>({});
    const [sessions, setSessions] = React.useState<Record<string, any>>({});

    const [timeFilter, setTimeFilter] = React.useState<TimeFilter>("当前");
    
    React.useEffect(() => {
        let promises = []
        const _fetch = async (
            url: string,
            setter: React.Dispatch<React.SetStateAction<Record<string, any>>>,
            key: string,
        ) => {
            let res = await fetch(url);
            let data = await res.json();
            setter(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                acc[cur[key]] = cur;
                return acc;
            }, {}));
        };
        promises.push(_fetch(api_paths.admin.resv_status, setResvStatus, 'status'));
        promises.push(_fetch(api_paths.admin.resv_privacy, setResvPrivacy, 'privacy'));
        promises.push(_fetch(api_paths.admin.users, setUsers, 'username'));
        promises.push(_fetch(api_paths.admin.rooms, setRooms, 'room_id'));
        promises.push(_fetch(api_paths.admin.sessions, setSessions, 'session_id'));
        Promise.all(promises);
    }, []);

    const comparator = (
        a: Record<string, any>,
        b: Record<string, any>,
        orderBy: string,
    ) => {
        if (orderBy === 'time_slots') {
            return compareTimeSlot(
                selectTimeSlot(a.time_slots, timeFilter),
                selectTimeSlot(b.time_slots, timeFilter),
            );
        } else {
            return descComp(a, b, orderBy);
        }
    };

    const columns = [
        { field: 'resv_id', label: '编号' },
        { field: 'username', label: '用户' },
        { field: 'title', label: '标题' },
        { field: 'status', label: '状态' },
        { field: 'room_id', label: '房间' },
        { field: 'session_id', label: '会话' },
        { field: 'privacy', label: '隐私' },
        { field: 'time_slots', label: '时间' },
        { field: 'actions', label: '操作', noSort: true },
    ];

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                预订管理
            </Typography>
            <FilterView
                url={api_paths.admin.reservations}
                reservations={reservations}
                setReservations={setReservations}
                
                resvStatus={resvStatus}
                resvPrivacy={resvPrivacy}
                users={users}
                rooms={rooms}
                sessions={sessions}

                time={timeFilter}
                setTime={setTimeFilter}
            />
            {reservations !== undefined && 
            <Table
                columns={columns}
                rows={reservations}
                compare={comparator}
                height='70vh'
                minWidth='1200px'
                getValueLabel={(row, field) => {
                    if (field === 'username') {
                        return (
                            <Typography variant="inherit" noWrap sx={{ maxWidth: "70px" }}>
                                {users[row[field]]?.name}
                            </Typography>
                        );
                    } else if (field === 'title' || field === 'session_id') {
                        return(
                            <Typography variant="inherit" noWrap style={{maxWidth: "130px"}}>
                                {row[field]}
                            </Typography>
                        );
                    } else if (field === 'status') {
                        return (
                            <Typography variant="inherit" noWrap sx={{ maxWidth: "70px" }}>
                                <Box component="span" 
                                    borderBottom={3} 
                                    borderColor={statusColors[row.status]}
                                >
                                    {resvStatus[row.status]?.label}
                                </Box>
                            </Typography>
                        );
                    } else if (field === 'privacy') {
                        return (
                            <Typography variant="inherit" noWrap sx={{ maxWidth: "70px" }}>
                                {resvPrivacy[row.privacy]?.label}
                            </Typography>
                        );
                    } else if (field === 'room_id') {
                        return (
                            <Typography variant="inherit" noWrap sx={{ maxWidth: "100px" }}>
                                {rooms[row.room_id]?.name}
                            </Typography>
                        );
                    } else if (field === 'time_slots') {
                        return (
                            <TimeView resv={row} timeFilter={timeFilter} />
                        );
                    } else if (field === 'actions') {
                        return (
                            <Tooltip title="编辑">
                                <IconButton size="small"
                                    component={Link} to={`/admin/reservations/edit?resv_id=${row.resv_id}`}>
                                    <EditIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        );
                    } else {
                        return row[field];
                    }
                }}
            />}
            {reservations === undefined &&
            <TableSkeleton
                rowCount={12}
                columns={columns.map(col => col.label)}
                height='70vh'
                minWidth='1200px'
            />}
            <Button fullWidth startIcon={<AddIcon />}
                component={Link} to="/admin/reservations/add" >
                添加预约
            </Button>
            <Box display="flex" flexWrap="wrap" pt={2}>
                <Box flexGrow={1} mr={1}>
                    <Status />
                </Box>
                <Box flexGrow={1} ml={1}>
                <Privacy />
                </Box>
            </Box>
        </Box>
    );
}

export default Reservations;