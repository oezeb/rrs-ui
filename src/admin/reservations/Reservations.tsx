import * as React from "react";
import { 
    Box,  
    Typography, 
    Button,
    IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Badge, Paper,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import TableSortLabel from '@mui/material/TableSortLabel';
import {  
    FormControl, InputLabel, Select,
} from "@mui/material";

import MenuItem from '@mui/material/MenuItem';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import EditIcon from '@mui/icons-material/Edit';

import { basicDescendingComparator, compareStartEndTime, getComparator, groupResvTimeSlots } from "../../util";
import { Link } from "../../Navigate";
import { paths as api_paths } from "../../api";
import dayjs from "dayjs";
import Status from "./status/Status";
import { statusColors } from "../../resvs/Resvs";
import Privacy from "./privacy/Privacy";
import { TableSkeleton } from "../Table";
import { TimeView } from "../../resvs/ResvsTable";

function Reservations() {
    const [reservations, setReservations] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [orderBy, setOrderBy] = React.useState('username');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);
    const [resvStatus, setResvStatus] = React.useState<Record<string, any>>({});
    const [users, setUsers] = React.useState<Record<string, any>>({});
    const [rooms, setRooms] = React.useState<Record<string, any>>({});
    const [sessions, setSessions] = React.useState<Record<string, any>>({});

    // filters
    const [username, setUsername] = React.useState<string|null>(null);
    const [roomId, setRoomId] = React.useState<string|null>(null);
    const [sessionId, setSessionId] = React.useState<string|null>(null);
    const [status, setStatus] = React.useState<Record<string, any>|null>(null);
    const [time, setTime] = React.useState<"全部" | "当前" | "历史">("当前");

    React.useEffect(() => {
        let args = [];
        if (username !== null) {
            args.push(`username=${username}`);
        }
        if (roomId !== null) {
            args.push(`room_id=${roomId}`);
        }
        if (sessionId !== null) {
            args.push(`session_id=${sessionId}`);
        }
        if (status != null) {
            args.push(`status=${status.status}`);
        }

        let url = api_paths.admin.reservations + (args.length ? `?${args.join('&')}` : '');
        let now = dayjs();
        fetch(url).then(res => res.json()).then(data => {
            // setReservations(data.map((resv: any) => ({
            //     ...resv,
            //     start_time: dayjs(resv.start_time),
            //     end_time: dayjs(resv.end_time),
            //     create_time: dayjs(resv.create_time),
            //     update_time: resv.update_time ? dayjs(resv.update_time) : null,
            // })).sort((a: any, b: any) => (a.start_time.isBefore(b.start_time) ? -1 : 1)).filter((resv: any) => {
            //     if (time === "全部") {
            //         return true;
            //     } else if (time === "当前") {
            //         return resv.end_time.isAfter(now);
            //     } else if (time === "历史") {
            //         return resv.end_time.isBefore(now);
            //     } else {
            //         return false;
            //     }
            // }));
            setReservations(groupResvTimeSlots(data).map((resv: any) => ({
                ...resv,
                create_time: dayjs(resv.create_time),
                update_time: resv.update_time ? dayjs(resv.update_time) : null,
            })).sort((a: any, b: any) => {
                if (a.time_slots.length && b.time_slots.length) {
                    return compareStartEndTime(a.time_slots[0], b.time_slots[0]);
                } else {
                    return b.time_slots.length - a.time_slots.length;
                }
            }).filter((resv: any) => {
                if (time === "全部") {
                    return true;
                } else if (time === "当前") {
                    return resv.time_slots.some((ts: any) => ts.end_time.isAfter(now));
                } else if (time === "历史") {
                    return resv.time_slots.every((ts: any) => ts.end_time.isBefore(now));
                } else {
                    return false;
                }
            }));
        });
    }, [status, username, roomId, sessionId, time]);

    React.useEffect(() => {
        fetch(api_paths.admin.resv_status)
            .then(res => res.json())
            .then(data => {
                setResvStatus(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.status] = cur;
                    return acc;
                }, {}));
            });
        fetch(api_paths.admin.users)
            .then(res => res.json())
            .then(data => {
                setUsers(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.username] = cur;
                    return acc;
                }, {}));
            });
        fetch(api_paths.admin.rooms)
            .then(res => res.json())
            .then(data => {
                setRooms(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.room_id] = cur;
                    return acc;
                }, {}));
            });
        fetch(api_paths.admin.sessions)
            .then(res => res.json())
            .then(data => {
                setSessions(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.session_id] = cur;
                    return acc;
                }, {}));
            });
    }, []);

    React.useEffect(() => {
        if (reservations === undefined) return;
        const comparator = getComparator(order, orderBy, descendingComparator);
        const sorted = reservations.sort(comparator);
        setSorted(sorted);
    }, [order, orderBy, reservations]);

    const descendingComparator = (
        a: Record<string, any>,
        b: Record<string, any>,
        orderBy: string,
    ) => {
        if (b[orderBy] === null) {
            return -1;
        } else if (a[orderBy] === null) {
            return 1;
        } else if (orderBy === 'start_time' || orderBy === 'end_time' || orderBy === 'create_time' || orderBy === 'update_time') {
            if (b[orderBy].isBefore(a[orderBy])) {
                return -1;
            } else if (b[orderBy].isAfter(a[orderBy])) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return basicDescendingComparator(a, b, orderBy);
        }
    };

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            if (reservations === undefined) return;
            const isAsc = orderBy === property && order === 'asc';
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(property);

            const comparator = getComparator(order, orderBy, descendingComparator);
            const sorted = reservations.sort(comparator);
            setSorted(sorted);
        },
        [order, orderBy, reservations],
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
        { field: 'resv_id', label: '预订号' },
        // { field: 'slot_id', label: '时间段号' },
        { field: 'username', label: '用户' },
        { field: 'title', label: '标题' },
        { field: 'status', label: '状态' },
        { field: 'room_id', label: '房间' },
        { field: 'session_id', label: '会话' },
        // { field: 'privacy', label: '隐私' },
        // { field: 'start_time', label: '开始时间' },
        // { field: 'end_time', label: '结束时间' },
        { field: 'time_slots', label: '时间' },
        // { field: 'create_time', label: '创建时间' },
        // { field: 'update_time', label: '更新时间' },
        { field: 'actions', label: '操作', noSort: true },
    ];

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                预订管理
            </Typography>
            <Box display="flex" flexDirection="row" flexWrap="wrap"
                justifyContent="space-between" alignItems="center">
                <Box flexGrow={1} />
                <>筛选<FilterAltIcon fontSize="small" />:</>
                <FormControl sx={{ ml: 1 }}>
                    <InputLabel>时间</InputLabel>
                    <Select autoWidth size="small" value={time} label="时间">
                        {["全部", "当前", "历史"].map((time: any) => (
                            <MenuItem key={time} value={time} onClick={() => setTime(time)}>
                                {time}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ ml: 1 }}>
                    <InputLabel>状态</InputLabel>
                    <Select autoWidth size="small" label="状态" value={status?.label ?? "全部"}>
                        <MenuItem onClick={() => setStatus(null)} value="全部">
                            <em>全部</em>
                        </MenuItem>
                        {Object.values(resvStatus).map((status: any) => (
                            <MenuItem key={status.status} value={status.label}
                                onClick={() => setStatus(status)}>
                                <Box display="inline" 
                                    borderBottom={3} 
                                    borderColor={statusColors[status.status]}
                                >
                                    {status.label}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ ml: 1 }}>
                    <InputLabel>用户</InputLabel>
                    <Select autoWidth size="small" label="用户" value={username ?? "全部"}>
                        <MenuItem value="全部" onClick={() => setUsername(null)}>
                            <em>全部</em>
                        </MenuItem>
                        {Array.from(new Set(reservations?.map(resv => resv.username)).keys()).map((username, i) => (
                            <MenuItem key={i} value={username}
                                onClick={() => setUsername(username)}>
                                {users[username]?.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ ml: 1 }}>
                    <InputLabel>房间</InputLabel>
                    <Select autoWidth size="small" label="房间" value={roomId ?? "全部"}>
                        <MenuItem value="全部" onClick={() => setRoomId(null)}>
                            <em>全部</em>
                        </MenuItem>
                        {Array.from(new Set(reservations?.map(resv => resv.room_id)).keys()).map((roomId, i) => (
                            <MenuItem key={i} value={roomId}
                                onClick={() => setRoomId(roomId)}>
                                {rooms[roomId]?.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ ml: 1 }}>
                    <InputLabel>会话</InputLabel>
                    <Select autoWidth size="small" label="会话" value={sessionId ?? "全部"}>
                        <MenuItem value="全部" onClick={() => setSessionId(null)}>
                            <em>全部</em>
                        </MenuItem>
                        {Array.from(new Set(reservations?.map(resv => resv.session_id)).keys()).map((sessionId, i) => (
                            <MenuItem key={i} value={sessionId}
                                onClick={() => setSessionId(sessionId)}>
                                {sessions[sessionId]?.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            {reservations === undefined &&
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden', height: "70vh"}}>
                <TableSkeleton rowCount={15} columns={columns.map(column => column.label)} />
            </Paper>}
            {reservations !== undefined && 
            <Paper sx={{ mt: 1, width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ minWidth: 750, height: "70vh"}}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {columns.map((col, i) => (
                                    col.noSort ?
                                    <TableCell key={i}><Typography fontWeight="bold">{col.label}</Typography></TableCell> :
                                    <SortHeadCell key={i} field={col.field} label={col.label} />
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sorted.map((resv, index) => (
                                <TableRow key={index}>
                                    <TableCell>{resv.resv_id}</TableCell>
                                    {/* <TableCell>{resv.slot_id}</TableCell> */}
                                    <TableCell>{users[resv.username]?.name}</TableCell>
                                    <TableCell>{resv.title}</TableCell>
                                    <TableCell>
                                        <Box display="inline" 
                                            borderBottom={3} 
                                            borderColor={statusColors[resv.status]}
                                            >{resvStatus[resv.status]?.label}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{rooms[resv.room_id]?.name}</TableCell>
                                    <TableCell>{sessions[resv.session_id]?.name}</TableCell>
                                    {/* <TableCell>{resvPrivacy[resv.privacy]?.label}</TableCell> */}
                                    {/* <TableCell>{resv.start_time.format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                                    <TableCell>{resv.end_time.format('YYYY-MM-DD HH:mm:ss')}</TableCell> */}
                                    <TableCell>
                                        <TimeView resv={resv} />
                                    </TableCell>
                                    {/* <TableCell>{resv.create_time.format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                                    <TableCell>{resv.update_time?.format('YYYY-MM-DD HH:mm:ss')}</TableCell> */}
                                    <TableCell>
                                        <Tooltip title="编辑">
                                            <IconButton component={Link} to={`/admin/reservations/edit?resv_id=${resv.resv_id}`} size="small">
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
            <Box display="flex" pt={2}>
                <Button fullWidth variant="text" color="primary" startIcon={<AddIcon />}
                    component={Link} to="/admin/reservations/add" >
                    添加预约
                </Button>
            </Box>

            <Box display="flex" pt={2}>
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

interface FilterProps {
    time: "全部" | "当前" | "历史";
    setTime: (time: "全部" | "当前" | "历史") => void;
    username: string|null;
    setUsername: (username: string|null) => void;
    resvId: string|number|null;
    setResvId: (resvId: string|number|null) => void;
    status: Record<string, any>|null;
    setStatus: (status: Record<string, any>|null) => void;
    statusOptions: Record<string, any>[];
    users: Record<string, any>;
    // rooms: Record<string, any>;
    // sessions: Record<string, any>;
    reservations: Record<string, any>[];
}

function Filter(props: FilterProps) {
    const { time, setTime, username, setUsername, resvId, setResvId, status, setStatus, statusOptions, users, reservations } = props;
    return (
        <Box display="flex" flexDirection="row" flexWrap="wrap"
            justifyContent="space-between" alignItems="center">
            <Box flexGrow={1} />
            <>筛选<FilterAltIcon fontSize="small" />:</>
            <FormControl sx={{ ml: 1 }}>
                <InputLabel>时间</InputLabel>
                <Select autoWidth size="small" value={time} label="时间">
                    {["全部", "当前", "历史"].map((time: any) => (
                        <MenuItem key={time} value={time} onClick={() => setTime(time)}>
                            {time}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{ ml: 1 }}>
                <InputLabel>状态</InputLabel>
                <Select autoWidth size="small" label="状态" value={status?.label ?? "全部"}>
                    <MenuItem onClick={() => setStatus(null)} value="全部">
                        <em>全部</em>
                    </MenuItem>
                    {statusOptions.map((status) => (
                        <MenuItem key={status.status} value={status.label}
                            onClick={() => setStatus(status)}>
                            <Box display="inline" 
                                borderBottom={3} 
                                borderColor={statusColors[status.status]}
                            >
                                {status.label}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{ ml: 1 }}>
                <InputLabel>用户</InputLabel>
                <Select autoWidth size="small" label="用户" value={username ?? "全部"}>
                    <MenuItem value="全部" onClick={() => setUsername(null)}>
                        <em>全部</em>
                    </MenuItem>
                    {Array.from(new Set(reservations.map(resv => resv.username)).keys()).map((username, i) => (
                        <MenuItem key={i} value={username}
                            onClick={() => setUsername(username)}>
                            {users[username]?.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{ ml: 1 }}>
                <InputLabel>预约号</InputLabel>
                <Select autoWidth size="small" label="预约号" value={resvId ?? "全部"}>
                    <MenuItem value="全部" onClick={() => setResvId(null)}>
                        <em>全部</em>
                    </MenuItem>
                    {Array.from(new Set(reservations.map(resv => resv.resv_id)).keys()).map((resvId, i) => (
                        <MenuItem key={i} value={resvId}
                            onClick={() => setResvId(resvId)}>
                            {resvId}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default Reservations;