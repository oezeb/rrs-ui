import DoneIcon from '@mui/icons-material/Done';
import {
    Box,
    IconButton,
    TextField,
    Tooltip,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import React from "react";
import SelectTime from 'reservations/add/SelectTime';

interface AddTimeSlotProps {
    date: Dayjs;
    setDate: (date: Dayjs) => void;

    room_id: string|number;
    session: Record<string, any>;

    onAdd: (slot: Record<string, any>) => void;
}

const AddTimeSlot = (props: AddTimeSlotProps) => {
    const { date, setDate, room_id, session, onAdd} = props;

    const today = dayjs();
    const window = {
        start: today > session.start_time ? today : session.start_time,
        end: today > session.end_time ? today : session.end_time,
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        let start_time = dayjs(`${date.format('YYYY-MM-DD')} ${data.get('start_time')}`);
        let end_time =   dayjs(`${date.format('YYYY-MM-DD')} ${data.get('end_time')}`);

        onAdd({ start_time, end_time });
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