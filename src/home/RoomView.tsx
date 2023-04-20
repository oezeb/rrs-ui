import { useEffect, useState } from 'react';
import {  Box, Skeleton, ListItem, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';
import Typography from '@mui/material/Typography';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { Dayjs } from 'dayjs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link } from 'react-router-dom';

import { time, compareStartEndTime } from '../util';
import { useAuth } from '../auth/AuthProvider';
import ResvsView from './ResvsView';

interface RoomViewProps {
    date: Dayjs;
    room: Record<string, any>;
    periods: Record<string, any>[];
    show_pending: boolean; // show pending reservations
    resv_button?: boolean;
}

export function RoomView(props: RoomViewProps) {
    const { date, room, periods, show_pending, resv_button } = props;
    const [reservations, setReservations] = useState<Record<string, any>[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        let url = `/api/reservations?room_id=${room.room_id}&date=${date.format('YYYY-MM-DD')}`;
        fetch(`${url}&status=1`).then((res) => res.json())
            .then((data) => {
                if (show_pending) {
                    fetch(`${url}&status=0`).then((res) => res.json())
                        .then((pending) => {
                            data = data.concat(pending).map((resv: Record<string, any>) => {
                                return {
                                    ...resv,
                                    start_time: time(resv.start_time),
                                    end_time: time(resv.end_time),
                                };
                            });
                            // sort by (start_time, end_time)
                            data.sort(compareStartEndTime)
                            setReservations(data);
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                } else {
                    data = data.map((resv: Record<string, any>) => {
                        return {
                            ...resv,
                            start_time: time(resv.start_time),
                            end_time: time(resv.end_time),
                        };
                    });
                    // sort by (start_time, end_time)
                    data.sort(compareStartEndTime)
                    setReservations(data);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }, [room.room_id, date, show_pending]);

    return (
        <Box width={140}  margin={1} >
            <Box border='1px solid #ccc' boxShadow='0 0 4px rgba(0,0,0,.1)'>
            <Typography fontSize='1em' textAlign='center' color='#1669b8' borderBottom='1px solid #ccc'>
                {room.name}
            </Typography>
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
                        <ListItemButton disabled={room.status !== 1}
                            component={Link}  to={`/reservations/new?room_id=${room.room_id}`}>
                            <ListItemText>
                                预约
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

export default RoomView;