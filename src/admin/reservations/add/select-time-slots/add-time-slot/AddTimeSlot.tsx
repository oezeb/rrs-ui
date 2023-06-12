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
import dayjs, { Dayjs } from "dayjs";
import React from "react";

import { paths as api_paths, resv_status } from "utils/api";
import { resvStatusColors as statusColors } from 'utils/util';
import SelectTime from './SelectTime';

interface AddTimeSlotProps {
    date: Dayjs;
    setDate: (date: Dayjs) => void;

    room_id?: string|number;
    session?: Record<string, any>;

    onAdd: (slot: Record<string, any>) => void;
}

const AddTimeSlot = (props: AddTimeSlotProps) => {
    const { date, setDate, room_id, session, onAdd} = props;
    const [resvStatus, setResvStatus] = React.useState<Record<string, any>>({});

    const window = { start: session?.start_time, end: session?.end_time };

    React.useEffect(() => {
        fetch(api_paths.admin.resv_status)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setResvStatus(data
                .reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.status] = cur;
                    return acc;
                }, {})
            ))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        let start_time = dayjs(`${date.format('YYYY-MM-DD')} ${data.get('start_time')}`);
        let end_time =   dayjs(`${date.format('YYYY-MM-DD')} ${data.get('end_time')}`);
        let status = data.get('status');

        onAdd({ start_time, end_time, status });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ margin: 'auto', mr: 2 }}>
                <TextField required size='small' type='date'
                    value={date.format('YYYY-MM-DD')}
                    inputProps={{
                        min: window.start?.format('YYYY-MM-DD'),
                        max: window.end?.format('YYYY-MM-DD'),
                    }}
                    onChange={(e) => {
                        setDate(dayjs(e.target.value));
                    }}
                />
            </Box>
            <SelectTime room_id={room_id} date={date} timeWindow={window} /> 
            <FormControl variant="standard" required sx={{ minWidth: 80,  ml: 2 }}>
                <InputLabel>状态</InputLabel>
                {Object.keys(resvStatus).length > 0 && 
                <Select name='status' defaultValue={resv_status.confirmed} required>
                    {Object.values(resvStatus)
                    .filter((status: any) => (
                        status.status !== resv_status.cancelled && status.status !== resv_status.rejected
                    ))
                    .map((status: any) => (
                        <MenuItem key={status.status} value={status.status}>
                            <Box component="span"
                                borderBottom={3} 
                                borderColor={statusColors[status.status]}
                            >
                                {status.label}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>}
            </FormControl>      
            <Box sx={{ margin: 'auto', ml: 2 }}>
                <Tooltip title='添加' placement='top'>
                    <IconButton size="small"  type="submit">
                        <DoneIcon fontSize="inherit"/>
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
}

export default AddTimeSlot;