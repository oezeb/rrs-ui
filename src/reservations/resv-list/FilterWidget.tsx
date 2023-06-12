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

export type Filter = "status" | "time";

interface FilterViewProps {
    setReservations: React.Dispatch<React.SetStateAction<Record<string, any>[]|undefined>>;
    resvStatus?: Record<string, any>;
    time: TimeFilter;
    setTime: (time: TimeFilter) => void;
};

const FilterWidget = (props: FilterViewProps) => {
    const { setReservations, resvStatus } = props;
    const { time, setTime } = props;
    const [status, setStatus] = React.useState<Record<string, any>|null>(null);

    React.useEffect(() => {
        let now = dayjs();
        fetch(api_paths.user_resv + (status === null ? "" : `?status=${status.status}`))
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
    }, [status, time, setReservations]);

    
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
        </Box>
    );
}

export default FilterWidget;