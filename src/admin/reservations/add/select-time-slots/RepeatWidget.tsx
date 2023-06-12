import React from "react";
import DoneIcon from '@mui/icons-material/Done';
import {
    Box,
    FormControl,
    FormHelperText,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Tooltip,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";

import { paths as api_paths, resv_status } from "utils/api";

export type RepeatType = "none"|"weekly";

interface RepeatWidgetProps {
    type: RepeatType;
    setType: (value: RepeatType) => void;

    has_conflict?: boolean;

    session?: Record<string, any>;

    onValidate: (until: Dayjs) => void;
}

const RepeatWidget = (props: RepeatWidgetProps) => {
    const { type, setType, has_conflict, session, onValidate } = props;
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);
        let until = dayjs(`${data.get('repeat_until')}`);
        onValidate(until);
    }

    return (
        <Box>
            <Box component="form" onSubmit={handleSubmit}  sx={{ display: 'flex', justifyContent: 'center', width: "100%", mt: 2 }}>
                <FormControl variant="standard" size="small">
                    <Select autoWidth size="small" value={type}>
                        <MenuItem value="none" onClick={() => setType("none")}>
                            不重复
                        </MenuItem>
                        <MenuItem value="weekly" onClick={() => setType("weekly")}>
                            每周
                        </MenuItem>
                    </Select>
                    <FormHelperText>重复预约选项</FormHelperText>
                </FormControl>
                <Box sx={{ ml: 2 }}>
                    <TextField  variant="standard" size="small"
                        name="repeat_until"
                        type="datetime-local"
                        disabled={type === "none"}
                        required={type !== "none"}
                        inputProps={{
                            min: session?.start_time.format('YYYY-MM-DDTHH:mm'),
                            max: session?.end_time.format('YYYY-MM-DDTHH:mm'),
                        }}
                        helperText="重复预约截止时间"
                    />
                </Box>
                <Box sx={{ ml: 2 }}>
                    <Tooltip title='验证' placement="top">
                    <span>
                        <IconButton size="small" disabled={type === "none"} type="submit">
                            <DoneIcon fontSize="inherit" color={has_conflict === undefined ? undefined : has_conflict ? "error" : "success"}/>
                        </IconButton>
                    </span>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );
}


export const hasConflict = async (slot: Record<string, any>, room_id: string|number) => {
    for(let date = slot.start_time; date < slot.end_time; date = date.add(1, 'day')) {
        let url = api_paths.admin.reservations + `?room_id=${room_id}&start_date=${date.format('YYYY-MM-DD')}`;
        try {
            let res = await fetch(url);
            if (!res.ok) throw new Error(res.statusText);
            let data = await res.json();
            let no_conflict = data
                .map((r: Record<string, any>) => ({
                    ...r,
                    start_time: dayjs(r.start_time),
                    end_time: dayjs(r.end_time),
                }))
                .every((r: Record<string, any>) => (
                    r.status === resv_status.cancelled || r.status === resv_status.rejected
                    || r.start_time.isSame(slot.end_time) || r.end_time.isSame(slot.start_time)
                    || r.start_time.isAfter(slot.end_time) || r.end_time.isBefore(slot.start_time)
                ));

            if (no_conflict === false) {
                return true;
            }
        } catch (err) {
            console.error(err);
        }
    }
    return false;
}

export const genSlots = (slots: Record<string, any>[], repeatType: RepeatType, until: Dayjs) => {
    let new_slots: Record<string, any>[] = [...slots]
    if (repeatType === "weekly") {
        for (let slot of slots) {
            let start = slot.start_time;
            let end = slot.end_time;
            while (true) {
                start = start.add(1, 'week');
                end = end.add(1, 'week');
                if (start.isAfter(until)) break;
                new_slots.push({
                    ...slot,
                    start_time: start,
                    end_time: end,
                });
            }
        }
    }
    return new_slots;
}

export default RepeatWidget;