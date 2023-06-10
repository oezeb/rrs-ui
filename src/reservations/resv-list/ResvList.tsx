import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
    Box,
    IconButton,
    Skeleton,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React from "react";

import { TimeView } from "reservations/Reservations";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { TimeFilter, dayjsComp, descComp, selectTimeSlot, resvStatusColors as statusColors } from 'utils/util';
import FilterWidget from "./FilterWidget";
import Table, { TableSkeleton } from 'utils/Table';

function ResvList() {
    const [reservations, setReservations] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [resvStatus, setResvStatus] = React.useState<Record<string, any>>({});
    const [rooms, setRooms] = React.useState<Record<string, any>>({});

    const [timeFilter, setTimeFilter] = React.useState<TimeFilter>("当前");
    
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));
    
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
        promises.push(_fetch(api_paths.resv_status, setResvStatus, 'status'));
        promises.push(_fetch(api_paths.rooms, setRooms, 'room_id'));
        Promise.all(promises);
    }, []);

    const comparator = (
        a: Record<string, any>,
        b: Record<string, any>,
        orderBy: string,
    ) => {
        if (orderBy === "time") {
            const a_ts = selectTimeSlot(a.time_slots, timeFilter);
            const b_ts = selectTimeSlot(b.time_slots, timeFilter);
            
            if (a_ts === null || b_ts === null) return 0;
            let start_comp = dayjsComp(a_ts.start_time, b_ts.start_time);
            return start_comp === 0 ? dayjsComp(a_ts.end_time, b_ts.end_time) : start_comp;
        } else {
            return descComp(a, b, orderBy);
        }
    };

    const columns = [
        { field: "resv_id", label: "编号" },
        { field: "title", label: "标题" },
        { field: "room_id", label: "房间" },
        { field: "time", label: "时间" },
        { field: "status", label: "状态" },
        { field: "detail", label: "详情", noSort: true },
    ]

    const renderValue = (row: Record<string, any>, field: string) => {
        switch (field) {
            case "room_id":
                return rooms[row.room_id]?.name ?? <Skeleton />;
            case "time":
                return <TimeView resv={row} mobile={mobile} timeFilter={timeFilter} />;
            case "status":
                return <Box component="span" 
                    borderBottom={3} 
                    borderColor={statusColors[row.status]}
                >
                    {resvStatus[row.status]?.label ?? row.status}
                </Box>;
            case "detail":
                return (
                    <Tooltip title="查看详情">
                        <IconButton component={Link} to={`/reservations/${row.resv_id}`}
                            size={mobile? "small": "medium"}
                        >
                            <NavigateNextIcon />
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
                预约记录
            </Typography>
            <FilterWidget
                setReservations={setReservations}
                time={timeFilter}
                setTime={setTimeFilter}
                resvStatus={resvStatus}
            />
            {reservations &&
            <Table
                columns={columns}
                rows={reservations}
                compare={comparator}
                getValueLabel={renderValue}
            />}
            {reservations === undefined &&
            <TableSkeleton
                rowCount={10}
                columns={columns.map((col) => col.label)}
            />}
        </Box>
    );
}

export default ResvList;