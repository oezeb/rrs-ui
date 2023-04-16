import { useEffect, useState } from 'react';
import {  Box, Button, Popover, Skeleton } from '@mui/material';
import Typography from '@mui/material/Typography';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { Dayjs } from 'dayjs';
import { time, compareStartEndTime } from '../util';
import Tooltip from '@mui/material/Tooltip';

interface ResvViewProps {
    resv: Record<string, any>;
};

function ResvView(props: ResvViewProps) {
    const { resv } = props;
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [user, setUser] = useState<Record<string, any> | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        const url = `/api/users?username=${resv.username}`;
        fetch(url).then((res) => res.json())
            .then((data) => {
                setUser(data[0]);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [resv.username]);

    const open = Boolean(anchorEl);
    return (
        <Box
            key={resv.resv_id}
            display="flex"
            borderTop="1px dotted rgba(0,0,0,.1)"
            bgcolor="lightgreen"
            overflow="hidden"
            whiteSpace="nowrap"
        >
            <Button 
                variant='text' 
                onClick={handleClick}
                fullWidth
                sx={{
                    color: 'text.secondary',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                }}
            >
                {resv.status === 0 ? "待审核" : resv.title}
            </Button>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box 
                    borderBottom="5px solid darkgreen"
                    p="0 1em 0 1em"
                    bgcolor="lightgreen"
                >
                    <Typography 
                        variant="h6" 
                        component="div"
                        color="darkgreen"
                    >
                        {resv.title}
                    </Typography>
                    <Typography variant="body2">
                        {user ? user.name : null}
                    </Typography>
                    <Typography variant="body2">
                        {resv.start_time.format('HH:mm')} - {resv.end_time.format('HH:mm')}
                    </Typography>
                </Box>
            </Popover>
        </Box>
    );
};

interface ResvsViewProps {
    periods: Record<string, any>[];
    reservations: Record<string, any>[];
};

export  function ResvsView(props: ResvsViewProps) {
    const { periods, reservations } = props;

    // start and end time of the periods and reservations
    let start: Dayjs|null=null, end: Dayjs|null=null;
    if (periods.length > 0 && reservations.length > 0) {
        if (periods[0].start_time.isBefore(reservations[0].start_time)) {
            start = periods[0].start_time;
        } else {
            start = reservations[0].start_time;
        }
        if (periods[periods.length - 1].end_time.isAfter(reservations[reservations.length - 1].end_time)) {
            end = periods[periods.length - 1].end_time;
        } else {
            end = reservations[reservations.length - 1].end_time;
        }
    } else if (periods.length > 0) {
        start = periods[0].start_time;
        end = periods[periods.length - 1].end_time;
    } else if (reservations.length > 0) {
        start = reservations[0].start_time;
        end = reservations[reservations.length - 1].end_time;
    } else {
        return <></>;
    }

    const totalDuration = end?.diff(start, 'second') || 0;
    const height = (start: Dayjs, end: Dayjs) => 100 * end.diff(start, 'second') / totalDuration;

    const period_view = (
        key: any,
        start: Dayjs,
        end: Dayjs,
        is_break: boolean,
    ) => {
        return (
            <Tooltip key={key} title={start.format('HH:mm') + ' - ' + end.format('HH:mm')}>
            <Box
                key={key}
                height={`calc(${height(start, end)}% - 1px)`}
                borderTop="1px dotted rgba(0,0,0,.1)"
                bgcolor={is_break ? 'rgba(0,0,0,.03)' : undefined}
            />
            </Tooltip>
        );
    };

    const period_views: JSX.Element[] = [];
    for (let i = 0; i < periods.length; i++) {
        const period = periods[i];
        if (i === 0 && start?.isBefore(period.start_time)) {
            period_views.push(period_view(`break-${i}`, start, period.start_time, true));
        }
        if (i > 0 && periods[i - 1].end_time.isBefore(period.start_time)) {
            period_views.push(period_view(`break-${i}`, periods[i - 1].end_time, period.start_time, true));
        }
        period_views.push(period_view(period.period_id, period.start_time, period.end_time, false));
        if (i === periods.length - 1 && end?.isAfter(period.end_time)) {
            period_views.push(period_view(`break-${i + 1}`, period.end_time, end, true));
        }
    }

    let pos = 0;
    const resv_views: JSX.Element[] = [];
    for (let i = 0; i < reservations.length; i++) {
        const resv = reservations[i];
        if (i === 0 && start?.isBefore(resv.start_time)) {
            pos += height(start, resv.start_time);
        }
        if (i > 0 && reservations[i - 1].end_time.isBefore(resv.start_time)) {
            pos += height(reservations[i - 1].end_time, resv.start_time);
        }
        resv_views.push(
            <Box
                key={resv.resv_id}
                position="absolute"
                top={`${pos}%`}
                height={`calc(${height(resv.start_time, resv.end_time)}% - 1px)`}
                width="100%"
                bgcolor="lightgreen"
            >
                <ResvView resv={resv} />
            </Box>
        );
        pos += height(resv.start_time, resv.end_time);
    }
    
    return (
        <Box position="relative" height="100%">
            {period_views}
            {resv_views}
        </Box>
    );
}

interface RoomViewProps {
    date: Dayjs;
    room: Record<string, any>;
    periods: Record<string, any>[];
    show_pending: boolean;
}

export function RoomView(props: RoomViewProps) {
    const { date, room, periods, show_pending } = props;
    const [reservations, setReservations] = useState<Record<string, any>[]>([]);

    useEffect(() => {
        let url = `/api/time_slots?room_id=${room.room_id}&date=${date.format('YYYY-MM-DD')}`;
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
                component='div'
                fontSize='.8em'
                textAlign='center'
                color='#999'
                bgcolor='#f8f8f8'
            >
                <EventSeatIcon fontSize='inherit' />{room.capacity}
            </Typography>
            <Box
                height={200}
                position="relative"
                bgcolor={'#f5f5f5'}
            >
                <ResvsView periods={periods} reservations={reservations} />
            </Box>
        </Box>
    )
}

interface RoomsViewProps {
    date: Dayjs;
    type: Record<string, any>;
    periods: Record<string, any>[];
}

function RoomsView(props: RoomsViewProps) {
    const { type, periods, date } = props;
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

    const RoomSkeleton = () =>(
        <Skeleton 
            width={140} 
            height={244}
            variant="rectangular"
            component="div"
            animation="wave"
            sx={{ margin: 1 }}
        />
    );

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
                    <RoomView 
                        key={room.room_id}
                        date={date}
                        room={room} 
                        periods={periods} 
                        show_pending={false}
                    />
                )) : (
                    <><RoomSkeleton /><RoomSkeleton /><RoomSkeleton /></>
                )}
            </Box>
        </Box>
    );
}

export default RoomsView;