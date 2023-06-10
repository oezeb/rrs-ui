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
import Badge from '@mui/material/Badge';

import { Link } from "utils/Navigate";
import Table, { TableSkeleton } from "utils/Table";
import { paths as api_paths } from "utils/api";
import { 
    TimeFilter, 
    compareTimeSlot, 
    descComp, 
    selectTimeSlot, 
    resvStatusColors as statusColors 
} from 'utils/util';
import FilterWidget from './FilterWidget';
import Privacy from "./privacy/Privacy";
import Status from "./status/Status";

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

    const renderValue = (row: Record<string, any>, field: string) => {
        const Text = (props: {text: React.ReactNode, maxWidth: string}) => (
            <Typography noWrap sx={{ maxWidth: props.maxWidth }}>
                {props.text}
            </Typography>
        );

        switch (field) {
            case 'username':
                return <Text text={users[row[field]]?.name} maxWidth="70px" />;
            case 'title':
                return <Text text={row[field]} maxWidth="130px" />;
            case 'status':
                return (
                    <Typography noWrap sx={{ maxWidth: "70px" }}>
                        <Box component="span" 
                            borderBottom={3} 
                            borderColor={statusColors[row.status]}
                        >
                            {resvStatus[row.status]?.label}
                        </Box>
                    </Typography>
                );
            case 'privacy':
                return <Text text={resvPrivacy[row.privacy]?.label} maxWidth="70px" />;
            case 'room_id':
                return <Text text={rooms[row.room_id]?.name} maxWidth="100px" />;
            case 'session_id':
                return <Text text={sessions[row.session_id]?.name} maxWidth="130px" />;
            case 'time_slots':
                return <TimeView resv={row} timeFilter={timeFilter} />;
            case 'actions':
                return (
                    <Tooltip title="编辑">
                        <IconButton size="small"
                            component={Link} to={`/admin/reservations/edit/${row.resv_id}/${row.username}`}
                        >
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
                预订管理
            </Typography>
            <FilterWidget
                reservations={reservations} setReservations={setReservations}
                
                resvStatus={resvStatus}
                resvPrivacy={resvPrivacy}
                users={users}
                rooms={rooms}
                sessions={sessions}

                time={timeFilter} setTime={setTimeFilter}
            />
            {reservations !== undefined && 
            <Table
                columns={columns}
                rows={reservations}
                compare={comparator}
                height='65vh'
                minWidth='1200px'
                getValueLabel={renderValue}
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

const TimeView = ({ resv, mobile, timeFilter }: { resv: any, mobile?: boolean, timeFilter?: TimeFilter }) => {
    const ts = selectTimeSlot(resv.time_slots, timeFilter);
    if (ts === null) return <Box>无</Box>

    return (
        <Badge badgeContent={2}  max={1} color="info"
            invisible={resv.time_slots.length <= 1}
            >
            <Box display="inline">
                {ts.start_time.format("YYYY-MM-DD HH:mm")}
                {mobile ? <br /> : " 至 "}
                {ts.end_time.format("YYYY-MM-DD HH:mm")}
            </Box>
        </Badge>
    );
};

export default Reservations;