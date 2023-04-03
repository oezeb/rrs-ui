import { useEffect, useState } from 'react';
import {  Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import dayjs from 'dayjs';
import { Period, Reservation, Room, RoomType } from './types';
import { time, fetch_periods } from './util';

interface PeriodsViewProps {
    periods: Period[];
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
}

function PeriodsView(props: PeriodsViewProps) {
    const { periods, start, end } = props;
    const totalDuration = end.diff(start, 'second');
    const view = (
        key: any,
        start: dayjs.Dayjs,
        end: dayjs.Dayjs,
        is_break: boolean,
    ) => {
        const height = 100 * end.diff(start, 'second') / totalDuration;
        return (
            <Box
                key={key}
                height={`calc(${height}% - 1px)`}
                borderTop="1px dotted rgba(0,0,0,.1)"
                bgcolor={is_break ? 'rgba(0,0,0,.03)' : undefined}
            />
        );
    };

    const views: JSX.Element[] = [];
    periods.forEach((period, i) => {
        if (i === 0 && start.isBefore(period.start_time)) {
            views.push(view(`break-${i}`, start, period.start_time, true));
        }
        if (i > 0 && periods[i - 1].end_time.isBefore(period.start_time)) {
            views.push(view(`break-${i}`, periods[i - 1].end_time, period.start_time, true));
        }
        views.push(view(period.period_id, period.start_time, period.end_time, false));
        if (i === periods.length - 1 && period.end_time.isBefore(end)) {
            views.push(view(`break-${i + 1}`, period.end_time, end, true));
        }
    });
    
    return (<Box height="100%" width="100%">{views}</Box>);
}

interface ReservationViewProps {
    reservations: Reservation[];
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
}

function ReservationsView(props: ReservationViewProps) {
    const { reservations, start, end } = props;
    const totalDuration = end.diff(start, 'second');
    const view = (
        key: any,
        start: dayjs.Dayjs,
        end: dayjs.Dayjs,
        is_break: boolean,
    ) => {
        const height = 100 * end.diff(start, 'second') / totalDuration;
        return (
            <Box
                key={key}
                height={`calc(${height}% - 1px)`}
                borderTop="1px dotted rgba(0,0,0,.1)"
                bgcolor={is_break ? undefined : "#ebfde0"}
            />
        );
    };

    const views: JSX.Element[] = [];
    reservations.forEach((resv, i) => {
        if (i === 0 && start.isBefore(resv.start_time)) {
            views.push(view(`break-${i}`, start, resv.start_time, true));
        }
        if (i > 0 && reservations[i - 1].end_time.isBefore(resv.start_time)) {
            views.push(view(`break-${i}`, reservations[i - 1].end_time, resv.start_time, true));
        }
        views.push(view(resv.resv_id, resv.start_time, resv.end_time, false));
        if (i === reservations.length - 1 && resv.end_time.isBefore(end)) {
            views.push(view(`break-${i + 1}`, resv.end_time, end, true));
        }
    });

    return (<Box height="100%" width="100%">{views}</Box>);
}

interface RoomViewProps {
    room: Room;
    periods: Period[];
}

function RoomView(props: RoomViewProps) {
    const { room, periods } = props;
    const [reservations, setReservations] = useState<Reservation[]>([]);

    useEffect(() => {
        fetch(`/api/public/reservations?room_id=${room.room_id}`)
            .then((res) => res.json())
            .then((data) => {
                setReservations(data.map((reservation: any) => {
                return {
                    ...reservation,
                    start_time: time(reservation.start_time),
                    end_time: time(reservation.end_time),
                };
            }));
            }
        );
    }, [room.room_id]);

    let start: dayjs.Dayjs|null=null, end: dayjs.Dayjs|null=null;
    if (periods.length > 0 && reservations.length > 0) {
        if (periods[0].start_time.isBefore(reservations[0].start_time)) {
            start = periods[0].start_time;
        }
        else {
            start = reservations[0].start_time;
        }
        if (periods[periods.length - 1].end_time.isAfter(reservations[reservations.length - 1].end_time)) {
            end = periods[periods.length - 1].end_time;
        }
        else {
            end = reservations[reservations.length - 1].end_time;
        }
    } else if (periods.length > 0) {
        start = periods[0].start_time;
        end = periods[periods.length - 1].end_time;
    } else if (reservations.length > 0) {
        start = reservations[0].start_time;
        end = reservations[reservations.length - 1].end_time;
    }

    return (
        <Box 
            width={140} 
            margin={1} 
            border='1px solid #ccc' 
            boxShadow='0 0 4px rgba(0,0,0,.1)'
        >
            <Typography
                fontSize='1em'
                textAlign='center'
                color='#1669b8'
                borderBottom='1px solid #ccc'
            >
                {room.name}
            </Typography>

            <Typography
                fontSize='.8em'
                textAlign='center'
                color='#999'
                bgcolor='#f8f8f8'
            >
                <EventSeatIcon fontSize='inherit' />{room.seating_capacity}
            </Typography>
            <Box
                height={200}
                position="relative"
                bgcolor={'#f5f5f5'}
            >
                <Box position="absolute" width="100%" height="100%">
                    {start && end && <PeriodsView periods={periods} start={start} end={end} />}
                </Box>
                <Box position="absolute" width="100%" height="100%">
                    {start && end && <ReservationsView reservations={reservations} start={start} end={end} />}
                </Box>
            </Box>
        </Box>
    )
}

interface RoomsViewProps {
    type: RoomType;
    periods: Period[];
}

function RoomsView(props: RoomsViewProps) {
    const { type, periods } = props;
    const [rooms, setRooms] = useState<Room[]>([]);
    useEffect(() => {
        fetch(`/api/rooms?type=${type.type}`)
            .then((res) => res.json())
            .then((data) => {
                setRooms(data);
            }
        );
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
                {rooms.map((room) => {
                    return <RoomView key={room.room_id} room={room} periods={periods} />
                })}
            </Box>
        </Box>
    );
}


export function RoomsByTypeView() {
    const [periods, setPeriods] = useState<Period[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

    useEffect(() => {
        fetch_periods().then((periods) => {
            setPeriods(periods);
        });

        fetch('/api/room_types').then((res) => res.json())
            .then((data) => {
                setRoomTypes(data);
            }
        );
    }, []);

    return (
        <Box>
            {roomTypes.map((type) => {
                return <RoomsView key={type.type} type={type} periods={periods} />
            })}
        </Box>
    );
}

export default RoomsView;