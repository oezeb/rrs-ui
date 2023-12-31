import {
    Box,
    FormControl,
    InputLabel,
    Select,
} from "@mui/material";
import * as React from "react";

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import MenuItem from '@mui/material/MenuItem';

import dayjs from "dayjs";
import { resvStatusColors as statusColors } from 'utils/util';
import { TimeFilter } from "utils/util";
import { paths as api_paths } from "utils/api";

export type Filter = "username" | "room_id" | "session_id" | "status" | "privacy" | "time";

interface FilterWidgetProps {
    reservations?: Record<string, any>[];
    setReservations: React.Dispatch<React.SetStateAction<Record<string, any>[]|undefined>>;
    
    resvStatus?: Record<string, any>;
    resvPrivacy?: Record<string, any>;
    users?: Record<string, any>;
    rooms?: Record<string, any>;
    sessions?: Record<string, any>;

    time: TimeFilter;
    setTime: (time: TimeFilter) => void;
};

const FilterWidget = (props: FilterWidgetProps) => {
    const { reservations, setReservations, resvStatus, resvPrivacy, users, rooms, sessions } = props;
    const { time, setTime } = props;
    const [username, setUsername] = React.useState<string|null>(null);
    const [roomId, setRoomId] = React.useState<string|null>(null);
    const [sessionId, setSessionId] = React.useState<string|null>(null);
    const [status, setStatus] = React.useState<Record<string, any>|null>(null);
    const [privacy, setPrivacy] = React.useState<Record<string, any>|null>(null);

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
        if (privacy != null) {
            args.push(`privacy=${privacy.privacy}`);
        }

        let now = dayjs();
        fetch(api_paths.admin.reservations + (args.length ? `?${args.join('&')}` : ''))
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setReservations(Object.values(data
                .reduce((acc: Record<string, any>, resv: any) => {
                    let slot = {
                        start_time: dayjs(resv.start_time),
                        end_time: dayjs(resv.end_time),
                        status: resv.status,
                        slot_id: resv.slot_id,
                    };

                    let key = `${resv.resv_id}-${resv.username}`;
                    if (acc[key]) {
                        acc[key].time_slots.push(slot);
                    } else {
                        acc[key] = {
                            ...resv,
                            time_slots: [slot],
                        };
                    }
                    return acc;
                }, {}))
                .map((resv: any) => ({
                    ...resv,
                    create_time: dayjs(resv.create_time),
                    update_time: resv.update_time ? dayjs(resv.update_time) : null,
                }))
                .filter((resv: any) => {
                    if (time === "全部") {
                        return true;
                    } else if (time === "当前") {
                        return resv.time_slots.some((ts: any) => ts.end_time.isAfter(now));
                    } else if (time === "历史") {
                        return resv.time_slots.some((ts: any) => ts.end_time.isBefore(now));
                    } else {
                        return false;
                    }
                })
            ))
            .catch(err => {
                console.log(err);
                setReservations([]);
            });
    }, [username, roomId, sessionId, status, privacy, time, setReservations]);

    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Box flexGrow={1} />
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: 60 }}>
                筛选
                <FilterAltIcon fontSize="small" />:
            </Box>
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
            {resvStatus && 
            <FormControl sx={{ ml: 1 }}>
                <InputLabel>状态</InputLabel>
                <Select autoWidth size="small" label="状态" value={status?.label ?? "全部"}>
                    <MenuItem onClick={() => setStatus(null)} value="全部">
                        <em>全部</em>
                    </MenuItem>
                    {Object.values(resvStatus).map((status: any) => (
                        <MenuItem key={status.status} value={status.label}
                            onClick={() => setStatus(status)}>
                            <Box component="span"
                                borderBottom={3} 
                                borderColor={statusColors[status.status]}
                            >
                                {status.label}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>}
            {resvPrivacy && 
            <FormControl sx={{ ml: 1 }}>
                <InputLabel>隐私</InputLabel>
                <Select autoWidth size="small" label="隐私" value={privacy?.label ?? "全部"}>
                    <MenuItem onClick={() => setPrivacy(null)} value="全部">
                        <em>全部</em>
                    </MenuItem>
                    {Object.values(resvPrivacy).map((privacy: any) => (
                        <MenuItem key={privacy.privacy} value={privacy.label}
                            onClick={() => setPrivacy(privacy)}>
                            {privacy.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>}
            <FormControl sx={{ ml: 1 }}>
                <InputLabel>用户</InputLabel>
                <Select autoWidth size="small" label="用户" value={username ?? "全部"}>
                    <MenuItem value="全部" onClick={() => setUsername(null)}>
                        <em>全部</em>
                    </MenuItem>
                    {Array.from(new Set(reservations?.map(resv => resv.username)).keys()).map((username, i) => (
                        <MenuItem key={i} value={username}
                            onClick={() => setUsername(username)}>
                            {users ? users[username]?.name : username}
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
                            {rooms ? rooms[roomId]?.name : roomId}
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
                            {sessions ? sessions[sessionId]?.name : sessionId}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default FilterWidget;