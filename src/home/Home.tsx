import { useState, useEffect, useMemo } from "react";
import Box from '@mui/material/Box';
import dayjs, { Dayjs } from "dayjs";
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { time } from "../util";
import RoomView, { RoomSkeleton } from "./RoomView";

function Home() {
    const [roomTypes, setRoomTypes] = useState<Record<string, any>[]>([]);
    const [date, setDate] = useState<Dayjs>(dayjs());
    const [prevDate, setPrevDate] = useState<Dayjs>(date);

    useEffect(() => {
        fetch('/api/room_types')
            .then((res) => res.json())
            .then((roomTypes) => setRoomTypes(roomTypes));
    }, []);

    return (
        <>
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
                        date={prevDate}
                    />
                ))}
            </Box>
        </>
    );
}

interface RoomsViewProps {
    date: Dayjs;
    type: Record<string, any>;
}

function RoomsView(props: RoomsViewProps) {
    const { type, date } = props;
    const [rooms, setRooms] = useState<Record<string, any>[]>([]);

    useEffect(() => {
        let url = `/api/rooms?type=${type.type}`;
        fetch(url).then((res) => res.json())
            .then((data) => {
                setRooms(data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [type.type]);

    return (
        <Box>
            <Typography>
                {type.label}
            </Typography>
            <Box
                display="flex"
                flexWrap="wrap"
            >
                {rooms.length ? rooms.map((room) => (
                    <RoomView key={room.room_id} date={date} room={room}
                        show_pending={false} resv_button />
                )) : (
                    <><RoomSkeleton /><RoomSkeleton /><RoomSkeleton /></>
                )}
            </Box>
        </Box>
    );
}

export default Home;