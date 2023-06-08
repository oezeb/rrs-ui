import { Box } from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import { useParams } from "react-router-dom";

import Badge from '@mui/material/Badge';

import { TimeFilter, selectTimeSlot } from "utils/util";
import ResvDetail from "./resv-detail/ResvDetail";
import ResvList from "./resv-list/ResvList";

function Reservations() {
    const { resv_id } = useParams();
    return resv_id === undefined ? <ResvList /> : <ResvDetail resv_id={resv_id} />;
}

export const TimeView = ({ resv, mobile, timeFilter }: { resv: any, mobile?: boolean, timeFilter?: TimeFilter }) => {
    const ts = selectTimeSlot(resv.time_slots, timeFilter);
    if (ts === null) return <Box>无</Box>

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

    const now = dayjs();
    if (ts.start_time.isSame(now, 'year') && ts.end_time.isSame(now, 'year')) {
        if (ts.start_time.isSame(now, 'month') && ts.end_time.isSame(now, 'month')) {
            if (ts.start_time.isSame(now, 'day') && ts.end_time.isSame(now, 'day')) {
                return box("HH:mm", "HH:mm");
            } else if (ts.start_time.isSame(ts.end_time, 'day')) {
                return box("MM-DD HH:mm", "HH:mm");
            } else {
                return box("MM-DD HH:mm", "MM-DD HH:mm");
            }
        } else {
            return box("MM-DD HH:mm", "MM-DD HH:mm");
        }
    } else if (ts.start_time.isSame(ts.end_time, 'year')) {
        return box("YYYY-MM-DD HH:mm", "MM-DD HH:mm");
    } else {
        return box("YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm");
    }
};

export default Reservations;