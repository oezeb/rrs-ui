import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import dayjs, { Dayjs } from "dayjs";
import React from "react";
import { paths as api_paths } from "utils/api";
import NoContent from 'utils/NoContent';
import RoomListByType, { RoomListByTypeSkeleton } from './RoomListByType';

function Home() {
    const [roomTypes, setRoomTypes] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [date, setDate] = React.useState<Dayjs>(dayjs());
    const [prevDate, setPrevDate] = React.useState<Dayjs>(date);

    React.useEffect(() => {
        fetch(api_paths.room_types)
            .then((res) => res.json())
            .then((data) => setRoomTypes(data))
            .catch((err) => {
                console.error(err);
                setRoomTypes([]);
            });
    }, []);

    const DateSelect = () => (
        <Box display="flex" justifyContent="flex-end">
            <Typography 
                variant="h6" component="h2"
                margin="auto"
                marginRight={1}
            >日期：</Typography>
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
    );

    if (roomTypes === undefined) return (
        <Box>
            <DateSelect />
            {Array(2).fill(0).map((_, i) => (
                <RoomListByTypeSkeleton key={i} />
            ))}
        </Box>
    );

    if (roomTypes.length === 0) return (
        <Box>
            <DateSelect />
            <NoContent />
        </Box>
    );

    return (
        <Box>
            <DateSelect />
            {roomTypes.map((type) => (
                <RoomListByType
                    key={type.type}
                    type={type}
                    date={prevDate}
                />
            ))}
        </Box>
    );
}

export default Home;