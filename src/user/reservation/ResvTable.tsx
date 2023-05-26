import {
    Box,
    IconButton,
    Skeleton,
    Table, TableBody, TableCell,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Badge from '@mui/material/Badge';

import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { compareStartEndTime, groupResvTimeSlots } from "utils/util";
import { statusColors } from "./Reservations";

interface ResvsTableProps {
    timeFilter: "全部" | "当前" | "历史";
    status: Record<string, any> | null;
    statusOptions: Record<string, any>[];
    is_mobile: boolean;
}

function ResvTable(props: ResvsTableProps) {
    const { timeFilter, status, statusOptions, is_mobile } = props;
    const [reservations, setReservations] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        let url = api_paths.user_resv;
        url += status != null ? `?status=${status.status}`: '';
        let now = dayjs();
        fetch(url).then(res => res.json()).then(data => {
            setReservations(groupResvTimeSlots(data).sort((a: any, b: any) => {
                if (a.time_slots.length && b.time_slots.length) {
                    return compareStartEndTime(a.time_slots[0], b.time_slots[0]);
                } else {
                    return b.time_slots.length - a.time_slots.length;
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
    }, [status, timeFilter]);

    const headRow = (titles: string[]) => (
        <TableRow>
            {titles.map((title) => (<TableCell key={title}>{title}</TableCell>))}
        </TableRow>
    );
    
    return (
        <Table stickyHeader size="small">
            <TableHead>
                {headRow(["标题", "房间", "时间", "状态", "详情"])}
            </TableHead>
            <TableBody>
                {reservations.map((resv) => (
                    <ResvTableRow key={resv.resv_id} resv={resv}  mobile={is_mobile}
                        statusList={statusOptions}
                    />
                ))}
            </TableBody>
        </Table>
    );
}

interface ResvTableRowProps {
    resv: Record<string, any>;
    statusList: Record<string, any>[];
    mobile: boolean;
}

function ResvTableRow({ resv, statusList, mobile }: ResvTableRowProps) {
    // 标题 | 房间 | 时间 | 状态 | 详情
    const [room, setRoom] = React.useState<Record<string, any> | null>(null);
    React.useEffect(() => {
        fetch(api_paths.rooms + `?room_id=${resv.room_id}`)
            .then(res => res.json())
            .then(data => {
                setRoom(data[0]);
            });
    }, [resv.room_id]);

    return (
        <TableRow>
            <TableCell>{resv.title}</TableCell>
            <TableCell>{room ? room.name : <Skeleton />}</TableCell>
            <TableCell><TimeView resv={resv} mobile={mobile} /></TableCell>
            <TableCell>
                <Box display="inline" 
                    borderBottom={3} 
                    borderColor={statusColors[resv.status]}
                >
                    {statusList[resv.status]?.label ?? resv.status}
                </Box>
            </TableCell>
            <TableCell>
                <Tooltip title="查看详情">
                    <IconButton component={Link} to={`/reservations/${resv.resv_id}`}
                        size={mobile? "small": "medium"}
                    >
                        <NavigateNextIcon />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
}

export const TimeView = ({ resv, mobile }: { resv: any, mobile?: boolean }) => {
    if (resv.time_slots.length === 0)
        return <Box>无</Box>;
    
    let now = dayjs();
    let ts = resv.time_slots[0];

    const box = (s_format: string, e_format: string) => (
        <Badge badgeContent={2}  max={1} color="info"
            invisible={resv.time_slots.length <= 1}
            >
            <Box display="inline">
                {ts.start_time.format(s_format)}
                {mobile ? <br /> : " 至 "}
                {ts.end_time.format(e_format)}
            </Box>
        </Badge>
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

export default ResvTable;