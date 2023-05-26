import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import dayjs, { Dayjs } from "dayjs";
import { useLang } from "providers/LangProvider";
import { useEffect, useState } from "react";
import { paths as api_paths } from "utils/api";
import RoomView, { RoomSkeleton } from "./RoomView";

function Home() {
    const lang = useLang();
    const [roomTypes, setRoomTypes] = useState<Record<string, any>[]>([]);
    const [date, setDate] = useState<Dayjs>(dayjs());
    const [prevDate, setPrevDate] = useState<Dayjs>(date);

    useEffect(() => {
        fetch(api_paths.room_types)
            .then((res) => res.json())
            .then((roomTypes) => setRoomTypes(roomTypes));
    }, []);

    return (<>
        <Box>
            <Box display="flex" justifyContent="flex-end">
                <Typography 
                    variant="h6" component="h2"
                    margin="auto"
                    marginRight={1}
                >
                    {strings[lang]['date']}:
                </Typography>
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
    </>);
}

interface RoomsViewProps {
    date: Dayjs;
    type: Record<string, any>;
}

function RoomsView(props: RoomsViewProps) {
    const { type, date } = props;
    const [rooms, setRooms] = useState<Record<string, any>[]>([]);

    useEffect(() => {
        let url = api_paths.rooms + `?type=${type.type}`;
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

const strings = {
    "zh": {
        "date": "日期",
    } as const,
    "en": {
        "date": "Date",
    } as const,
} as const;

export default Home;