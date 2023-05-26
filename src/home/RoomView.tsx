import { useEffect, useState } from 'react';
import { Box, Skeleton, ListItem, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';
import Typography from '@mui/material/Typography';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { Dayjs } from 'dayjs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { time, compareStartEndTime } from 'utils/util';
import { useAuth } from 'providers/AuthProvider';
import ResvsView from './RoomResvView';
import { usePeriods } from 'providers/PeriodsProvider';
import { Link } from 'utils/Navigate';
import { paths as api_paths, resv_status, room_status } from "utils/api";
import { useLang } from 'providers/LangProvider';

interface RoomViewProps {
    date: Dayjs;
    room: Record<string, any>;
    show_pending: boolean; // show pending reservations
    resv_button?: boolean;
}

export function RoomView(props: RoomViewProps) {
    const lang = useLang();
    const { date, room, show_pending, resv_button } = props;
    const [reservations, setReservations] = useState<Record<string, any>[]>([]);
    const { user } = useAuth();
    const { periods } = usePeriods();

    useEffect(() => {
        let today = date.format('YYYY-MM-DD');
        let url = api_paths.reservations + `?room_id=${room.room_id}&start_date=${today}`;
        fetch(url).then((res) => res.json())
            .then((data) => {
                setReservations(data.filter((r: Record<string, any>) => (
                    (show_pending && r.status === resv_status.pending) || r.status === resv_status.confirmed
                )).map((resv: Record<string, any>) => ({
                    ...resv,
                    start_time: time(resv.start_time),
                    end_time: time(resv.end_time),
                })).sort(compareStartEndTime));
            })
            .catch((err) => {
                console.error(err);
            });
    }, [room.room_id, date, show_pending]);

    return (
        <Box width={140}  margin={1} >
            <Box border='1px solid #ccc' boxShadow='0 0 4px rgba(0,0,0,.1)'>
                <Link to={`/rooms/${room.room_id}`} style={{ textDecoration: 'none' }}>
                    <Typography fontSize='1em' textAlign='center' color='#1669b8' borderBottom='1px solid #ccc'>
                        {room.name}
                    </Typography>
                </Link>
                <Typography component='div' fontSize='.8em' textAlign='center' color='#999' bgcolor='#f8f8f8'>
                    <EventSeatIcon fontSize='inherit' />{room.capacity}
                </Typography>
                <Box height={200} position="relative" bgcolor={'#f5f5f5'}>
                    <ResvsView periods={periods} reservations={reservations} />
                </Box>
            </Box>
            {user && resv_button && (
                <Box width="100%">
                    <ListItem dense disablePadding
                        sx={{ '&:hover': { backgroundColor: 'transparent' } }} 
                    >
                        <ListItemButton disabled={room.status !== room_status.available}
                            component={Link}  to={`/reservations/add/${room.room_id}`}>
                            <ListItemText>
                                {strings[lang].resv}
                            </ListItemText>
                            <ListItemIcon sx={{
                                minWidth: 0,
                            }}>
                                <NavigateNextIcon />
                            </ListItemIcon>
                        </ListItemButton>
                    </ListItem>
                </Box>
            )}
        </Box>
    )
}

export const RoomSkeleton = () =>(
    <Skeleton width={140} height={244} variant="rectangular" component="div"
        animation="wave" sx={{ margin: 1 }} />
);

const strings = {
    "zh": {
        resv: "预约",
    } as const,
    "en": {
        resv: "Reserve",
    } as const,
} as const;

export default RoomView;