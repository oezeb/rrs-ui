import DoneIcon from '@mui/icons-material/Done';
import {
    Box,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";

import { useSnackbar } from "providers/SnackbarProvider";
import { SelectDateTimeProps as _SelectDateTimeProps } from "reservations/add/SelectDateTime";
import SelectTime from 'reservations/add/SelectTime';
import { paths as api_paths, resv_status } from "utils/api";

interface SelectDateTimeProps extends _SelectDateTimeProps {
    session: Record<string, any>;

    slots: Record<string, any>[];
    setSlots: (slots: Record<string, any>[]) => void;
}

const SelectDateTime = (props: SelectDateTimeProps) => {
    const { date, setDate, slots, setSlots, room_id, session } = props;
    const [resvStatus, setResvStatus] = React.useState<Record<string, any>[]>([]);

    const { showSnackbar } = useSnackbar();
   
    const today = dayjs();
    const window = {
        start: today > session.start_time ? today : session.start_time,
        end: today > session.end_time ? today : session.end_time,
    };

    React.useEffect(() => {
        fetch(api_paths.admin.resv_status)
            .then(res => res.json())
            .then(data => setResvStatus(data));
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        let start_time = dayjs(`${date.format('YYYY-MM-DD')} ${data.get('start_time')}`);
        let end_time =   dayjs(`${date.format('YYYY-MM-DD')} ${data.get('end_time')}`);

        let conflict: number = -1;
        for (let i = 0; i < slots.length; i++) {
            let slot = slots[i];
            if (slot.end_time.isBefore(start_time) || slot.start_time.isAfter(end_time)) {
                continue;
            } else {
                conflict = i;
                break;
            }
        }

        if (conflict !== -1) {
            showSnackbar({
                message: `时间段与已选时间段${conflict + 1}重叠`,
                severity: 'error',
            });
        } else {
            setSlots([...props.slots, {
                start_time: dayjs(start_time),
                end_time: dayjs(end_time),
                status: data.get('status'),
            }]);

            setDate(dayjs());

            showSnackbar({
                message: '添加成功',
                severity: 'success',
                duration: 2000,
            });
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ margin: 'auto', mr: 2 }}>
                <TextField required size='small' type='date'
                    value={date.format('YYYY-MM-DD')}
                    inputProps={{
                        min: window.start.format('YYYY-MM-DD'),
                        max: window.end.format('YYYY-MM-DD'),
                    }}
                    onChange={(e) => {
                        setDate(dayjs(e.target.value));
                    }}
                />
            </Box>
            <SelectTime room_id={room_id} date={date} timeWindow={window} />
            <FormControl variant="standard" sx={{ minWidth: 80,  ml: 2 }}>
                <InputLabel>状态</InputLabel>
                <Select name='status' defaultValue={resv_status.confirmed}>
                    {resvStatus.map((status) => (
                        <MenuItem key={status.status} value={status.status}>
                            {status.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>           
            <Box sx={{ margin: 'auto', ml: 2 }}>
                <Tooltip title='添加' placement='top'>
                    <IconButton size="small"  type="submit">
                        <DoneIcon fontSize="small"/>
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
}

export default SelectDateTime;