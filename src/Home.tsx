import { useState, useEffect, useMemo } from "react";
import Box from '@mui/material/Box';
import RoomsView from "./views/RoomsView";
import { Period, RoomType } from "./types";
import dayjs, { Dayjs } from "dayjs";
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { time } from "./util";

function Home() {
    const [periods, setPeriods] = useState<Period[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [date, setDate] = useState<Dayjs>(dayjs());
    const [prevDate, setPrevDate] = useState<Dayjs>(date);

    const periodsMemo = useMemo(async () => {
        let res = await fetch('/api/periods');
        let json = await res.json();
        let periods = json.map((period: any) => ({
            period_id: period.period_id,
            start_time: time(period.start_time),
            end_time: time(period.end_time),
        }));
        return periods;
    }, []);

    useEffect(() => {
        periodsMemo.then((periods) => {
            setPeriods(periods);
        });

        fetch('/api/room_types')
            .then((res) => res.json())
            .then((roomTypes) => setRoomTypes(roomTypes));
    }, [periodsMemo]);

    return (
        <Box>
            <Box display="flex" justifyContent="flex-end">
                <Typography 
                    variant="h6" component="h2"
                    margin="auto"
                    marginRight={1}
                >日期:</Typography>
                <TextField 
                    size='small' 
                    variant='outlined'
                    type='date'
                    value={date.format('YYYY-MM-DD')}
                    onChange={(e) => {
                        setDate(dayjs(e.target.value));
                        setPrevDate(dayjs(e.target.value));
                    }}
                />
            </Box>
            {roomTypes.map((type) => (
                <RoomsView
                    key={type.type} 
                    type={type} 
                    periods={periods} 
                    date={prevDate}
                />
            ))}
        </Box>
    );
}

export default Home;