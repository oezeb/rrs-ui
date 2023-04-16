import React from "react";
import { compareStartEndTime } from "./util";
import dayjs, { Dayjs } from "dayjs";
import {  Table, TableBody, TableCell, TableRow, TableHead, List, ListItem, Box, useTheme, useMediaQuery, Tooltip, Chip, FormControl, InputLabel, Select, SelectChangeEvent, FormControlLabel, Switch, IconButton, ListSubheader, Collapse } from "@mui/material";

import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate, useParams } from "react-router-dom";

// 0: 待审核、1: 审核通过、2: 已取消、3: 审核未通过
// const statusColors = ["#FFC107", "#00CC66", "#A9A9A9", "#FF5733"];
const statusColors = (status: number) => {
    switch(status) {
        case 0: return 'warning';
        case 1: return 'success';
        case 2: return 'default';
        case 3: return 'error';
    }
    return undefined;
}

interface ResvDetailsViewProps {
    resv_id: string;
    statusList: Record<string, any>[];
    mobile?: boolean;
}

function ResvDetailsView({ resv_id, statusList, mobile }: ResvDetailsViewProps) {
    /**
     * 标题：{resv.title}
     * 状态：{resv.status} 0: 待审核、1: 审核通过、2: 已取消、3: 审核未通过
     * 房间：{resv.room.name}
     *     状态：{resv.room.status} 0: 不可用、1: 可用
     *     容量：{resv.room.capacity}
     *     类型：{resv.room.type}
     * 机密程度：{resv.secu_level} 0: 公开、1: 匿名、2: 私密
     * 时间：{resv.time_slots[0].start_time} 至 {resv.time_slots[0].end_time} (dropdown if resv.time_slots more than 1 `+>`)
     * 备注：{resv.note}
     */
    const [resv, setResv] = React.useState<Record<string, any> | null>(null);
    const [room, setRoom] = React.useState<Record<string, any> | null>(null);
    const [roomStatusList, setRoomStatusList] = React.useState<Record<string, any>[]>([]);
    const [roomTypeList, setRoomTypeList] = React.useState<Record<string, any>[]>([]);
    const [secuLevelList, setSecuLevelList] = React.useState<Record<string, any>[]>([]);
    // const [timeOpen, setTimeOpen] = React.useState(false); // time slot dropdown
    const [roomOpen, setRoomOpen] = React.useState(true); // room dropdown

    React.useEffect(() => {
        fetch(`/api/user/reservation?resv_id=${resv_id}&group_by_resv=true`)
            .then(res => res.json())
            .then(data => {
                setResv({
                    ...data[0],
                    time_slots: data[0].time_slots.map((ts: Record<string, any>) => ({
                        start_time: dayjs(ts.start_time),
                        end_time: dayjs(ts.end_time),
                    })),
                });
            });
    }, [resv_id]);

    React.useEffect(() => {
        if (resv === null) {
            setRoom(null);
        } else {
            fetch(`/api/rooms?room_id=${resv.room_id}`)
                .then(res => res.json())
                .then(data => {
                    setRoom(data[0]);
                });
        }
    }, [resv]);

    React.useEffect(() => {
        fetch(`/api/room_status`)
            .then(res => res.json())
            .then(data => {
                setRoomStatusList(data);
            });
            
        fetch(`/api/room_types`)
            .then(res => res.json())
            .then(data => {
                setRoomTypeList(data);
            });
            
        fetch(`/api/resv_secu_levels`)
            .then(res => res.json())
            .then(data => {
                setSecuLevelList(data);
            });
    }, []);

    const ListItemView = ({ label, value, divider, icon, onClick }:
        { label: string, value: string, divider?: boolean, icon?: React.ReactNode, onClick?: () => void }) => (
        <ListItem dense divider={divider}>
            <ListItemText>
                <Box sx={{ display: 'flex' }}>
                    <Typography variant="body1" fontWeight="bold">{label}:</Typography>
                    <Typography variant="body1" sx={{ ml: 1 }}>{value}</Typography>
                </Box>
            </ListItemText>
            <ListItemIcon>
                <IconButton onClick={onClick}>
                    {icon}
                </IconButton>
            </ListItemIcon>
        </ListItem>
    );

    const formatTime = (time: Dayjs) => {
        return time.format("YYYY/MM/DD HH:mm");
    }

    return (
        <Box>
            {resv === null ? "加载中..." : (
                <List>
                    <ListItemView label="标题" value={resv.title} />
                    <ListItemView label="状态" value={statusList[resv.status]?.label} />
                    <ListItemView label="房间" value={room?.name} divider={roomOpen} icon={roomOpen ? <ExpandLess /> : <ExpandMore />} onClick={() => setRoomOpen(!roomOpen)} />
                    <Collapse in={roomOpen} timeout="auto" unmountOnExit>
                        <List sx={{ pl: 4 }}>
                            <ListItemView label="状态" value={roomStatusList[room?.status]?.label} />
                            <ListItemView label="容量" value={room?.capacity} />
                            <ListItemView label="类型" value={roomTypeList[room?.type]?.label} />
                        </List>
                    </Collapse>
                    <ListItemView label="机密程度" value={secuLevelList[resv.secu_level]?.label} />
                    <ListItem dense>
                        <ListItemText>
                            <Box sx={{ display: 'flex' }}>
                                <Typography variant="body1" fontWeight="bold">时间：</Typography>
                                <Typography variant="body1" sx={{ ml: 1 }}>
                                    {formatTime(resv.time_slots[0].start_time)}
                                    {mobile ? <br /> : " 至 "}
                                    {formatTime(resv.time_slots[0].end_time)}
                                </Typography>
                            </Box>
                        </ListItemText>
                    </ListItem>
                    <ListItemView label="备注" value={resv.note} />
                </List>
            )}
        </Box>
    );
}

interface ResvTableProps {
    resv: Record<string, any>;
    statusList: Record<string, any>[];
    timeFilter: "全部" | "当前" | "历史";
    mobile: boolean;
}

function ResvTableRow({ resv, statusList, timeFilter, mobile }: ResvTableProps) {
    // 标题 | 房间 | 时间 | 状态
    const [room, setRoom] = React.useState<Record<string, any> | null>(null);
    let navigate = useNavigate();
    React.useEffect(() => {
        fetch(`/api/rooms?room_id=${resv.room_id}`)
            .then(res => res.json())
            .then(data => {
                setRoom(data[0]);
            });
    }, [resv.room_id]);

    const TimeView = () => {
        let now = dayjs();
        let ts = resv.time_slots[0];
        if (timeFilter === "当前" && ts.end_time.isBefore(now)) {
            for (let i = 1; i < resv.time_slots.length; i++) {
                if (resv.time_slots[i].end_time.isAfter(now)) {
                    ts = resv.time_slots[i];
                    break;
                }
            }
        } else if (timeFilter === "历史" && ts.end_time.isAfter(now)) {
            for (let i = 1; i < resv.time_slots.length; i++) {
                if (resv.time_slots[i].end_time.isBefore(now)) {
                    ts = resv.time_slots[i];
                    break;
                }
            }
        }

        const box = (s_format: string, e_format: string) => (
            <Box>
                {ts.start_time.format(s_format)}
                {mobile ? <br /> : " 至 "}
                {ts.end_time.format(e_format)}
            </Box>
        )

        if (ts.start_time.isSame(now, 'year') && ts.end_time.isSame(now, 'year')) {
            if (ts.start_time.isSame(now, 'month') && ts.end_time.isSame(now, 'month')) {
                if (ts.start_time.isSame(now, 'day') && ts.end_time.isSame(now, 'day')) {
                    return box("HH:mm", "HH:mm");
                } else if (ts.start_time.isSame(ts.end_time, 'day')) {
                    return box("MM/DD HH:mm", "HH:mm");
                } else {
                    return box("MM/DD HH:mm", "MM/DD HH:mm");
                }
            } else {
                return box("MM/DD HH:mm", "MM/DD HH:mm");
            }
        } else if (ts.start_time.isSame(ts.end_time, 'year')) {
            return box("YYYY/MM/DD HH:mm", "MM/DD HH:mm");
        } else {
            return box("YYYY/MM/DD HH:mm", "YYYY/MM/DD HH:mm");
        }
    };

    return (
        <TableRow>
            <TableCell>{resv.title}</TableCell>
            <TableCell>{room ? room.name : "加载中..."}</TableCell>
            <TableCell><TimeView /></TableCell>
            <TableCell>
                <Chip 
                    label={statusList[resv.status]?.label ?? resv.status}
                    size={mobile? "small": "medium"}
                    color={statusColors(resv.status)}
                />
            </TableCell>
            <TableCell>
                <Tooltip title="查看详情">
                    <IconButton
                        onClick={() => navigate(`/reservations/${resv.resv_id}`)}
                        size={mobile? "small": "medium"}
                    >
                        <NavigateNextIcon />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
}

function Reservations() {
    const [reservations, setReservations] = React.useState<Record<string, any>[]>([]);
    const [status, setStatus] = React.useState<Record<string, any> | null>(null);
    const [statusOptions, setStatusOptions] = React.useState<Record<string, any>[]>([]);
    const [timeFilter, setTimeFilter] = React.useState<"全部" | "当前" | "历史">("当前");
    const { resv_id } = useParams();
    const theme = useTheme();
    const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

    React.useEffect(() => {
        if (!resv_id) {
            let url = '/api/user/reservation?group_by_resv=true';
            let now = dayjs();
            if (status !== null) {
                url += `&status=${status.status}`;
            }
            fetch(url).then(res => res.json()).then(data => {
                setReservations(data.map((resv: any) => {
                    resv.time_slots = resv.time_slots.map((ts: any) => {
                        ts.start_time = dayjs(ts.start_time);
                        ts.end_time = dayjs(ts.end_time);
                        return ts;
                    }).sort(compareStartEndTime);
                    return resv;
                }).sort((a: any, b: any) => {
                    if (a.time_slots.length === 0 && b.time_slots.length === 0) {
                        return 0;
                    } else if (a.time_slots.length === 0) {
                        return 1;
                    } else if (b.time_slots.length === 0) {
                        return -1;
                    } else {
                        return compareStartEndTime(a.time_slots[0], b.time_slots[0]);
                    }
                }).filter((resv: any) => {
                    if (timeFilter === "全部") {
                        return true;
                    } else if (timeFilter === "当前") {
                        return resv.time_slots.some((ts: any) => ts.end_time.isAfter(now));
                    } else if (timeFilter === "历史") {
                        return resv.time_slots.every((ts: any) => ts.end_time.isBefore(now));
                    } else {
                        return false;
                    }
                }));
            });
        }
    }, [status, timeFilter, resv_id]);

    React.useEffect(() => {
        let url = '/api/resv_status';
        fetch(url).then(res => res.json()).then(res => {
            setStatusOptions(res.sort((a: any, b: any) => a.status - b.status));
        });
    }, []);

    if (resv_id) {
        return <ResvDetailsView resv_id={resv_id} statusList={statusOptions} mobile={is_mobile} />;
    } else {
        return (
            <Box>
                {/* Filters */}
                <Box 
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                >
                    <Box flexGrow={1} />
                    <>筛选<FilterAltIcon fontSize="small" />:</>
                    <FormControl sx={{ ml: 1 }}>
                        <InputLabel>时间</InputLabel>
                        <Select
                            autoWidth
                            value={timeFilter}
                            label="时间"
                            size="small"
                        >
                            {["全部", "当前", "历史"].map((time: any) => (
                                <MenuItem
                                    key={time}
                                    onClick={() => setTimeFilter(time)}
                                    value={time}
                                >
                                    {time}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ ml: 1 }}>
                        <InputLabel>状态</InputLabel>
                        <Select
                            autoWidth
                            value={status?.label ?? "全部"}
                            label="状态"
                            size="small"
                        >
                            <MenuItem 
                                onClick={() => setStatus(null)}
                                value="全部"
                            >
                                <em>全部</em>
                            </MenuItem>
                            {statusOptions.map((status) => (
                                <MenuItem 
                                    key={status.status}
                                    onClick={() => setStatus(status)}
                                    value={status.label}
                                >
                                    {status.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                {/* Table */}
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>标题</TableCell>
                            <TableCell>房间</TableCell>
                            <TableCell>时间</TableCell>
                            <TableCell>状态</TableCell>
                            <TableCell>详情</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reservations.map((resv) => (
                            <ResvTableRow
                                key={resv.resv_id} 
                                resv={resv} 
                                statusList={statusOptions}
                                timeFilter={timeFilter}
                                mobile={is_mobile} 
                            />
                        ))}
                    </TableBody>
                </Table>
            </Box>
        );
    }
}

export default Reservations;