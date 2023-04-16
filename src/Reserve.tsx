import { useEffect, useState } from "react";
import { Dict, Period, Reservation, Room, RoomType, User } from "./types";
import { fetchPeriods, fetchTranslation, links as get_links, time } from "./util";
import { useNavigate, useParams } from "react-router-dom";
import Template from "./templates/AppbarDrawer";
import { Autocomplete, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, Snackbar, TableHead, TextField, Toolbar, Typography } from "@mui/material";
import EventSeatIcon from '@mui/icons-material/EventSeat';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Alert, Table, TableBody, TableCell, TableRow, Button } from "@mui/material";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import dayjs, { Dayjs } from "dayjs";
import weekday from 'dayjs/plugin/weekday';
import 'dayjs/locale/zh-cn'
import RoomsView, { ResvsView, RoomView } from "./views/RoomsView";

dayjs.extend(weekday);
dayjs.locale('zh-cn');

function Reserve() {
    const [types, setTypes] = useState<RoomType[]>([]);
    let navigate = useNavigate();
    const { room_id } = useParams();

    useEffect(() => {
        if (!room_id) {
            let url = `/api/room_types`;
            fetch(url).then((res) => res.json())
                .then((data) => {
                    setTypes(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [room_id]);

    return (
        <>{room_id ? <RoomBook room_id={room_id} /> :
            types.map((type) => (
            <RoomListView key={type.type} type={type} navigate={navigate} />
        ))}</>
    );
}

interface RoomListViewProps {
    type: RoomType;
    navigate: (path: string) => void;
}

function RoomListView(props: RoomListViewProps) {
    const { type, navigate } = props;
    const [rooms, setRooms] = useState<Room[] | null>(null);

    useEffect(() => {
        let url = `/api/rooms?type=${type.type}`
        fetch(url).then((res) => res.json())
            .then((data) => {
                setRooms(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [type.type]);

    const ListItemSkeleton = () => (
        <ListItem divider dense>
            <ListItemText>
                <Typography >
                    <Skeleton />
                </Typography>
            </ListItemText>
        </ListItem>
    );

    if (rooms === null) {
        return (
            <List>
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
            </List>
        )
    } else if (rooms.length === 0) {
        return <p>No Rooms, Come Back Later</p>;
    } else {
        return (
            <Box>
                <Typography variant="h5" sx={{ m: 2 }} >
                    {type.label}
                </Typography>
                <List>
                    {rooms.map((room) => (
                        <ListItem key={room.room_id} divider dense>
                            <ListItemButton
                                onClick={() => {
                                    navigate(`/reserve/${room.room_id}`);
                                }}
                            >
                                <ListItemText primary={room.name} />
                                <ListItemIcon>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <EventSeatIcon fontSize='inherit' sx={{ mr: 1 }} /> {room.capacity}
                                    </Box>
                                </ListItemIcon>
                                <NavigateNextIcon />
                            </ListItemButton>
                        </ListItem>
                        
                    ))}
                </List>
            </Box>
        );
    }
}

function RoomBook({ room_id }: { room_id: string }) {
    const [periods, setPeriods] = useState<Period[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [room, setRoom] = useState<Room | undefined | null>(undefined);
    const [start, setStart] = useState<Option|null>(null);
    const [end, setEnd] = useState<Option|null>(null);
    const [date, setDate] = useState(dayjs());
    const [dates, setDates] = useState<Dayjs[]>([]);
    const [max_time, setMaxTime] = useState(0);
    const [msg, SetMsg] = useState<Record<string, any>>({});

    useEffect(() => {
        fetchPeriods().then((data) => {
            setPeriods(data);
        }).catch((err) => {
            console.error(err);
        });
    }, []);

    useEffect(() => {
        let url = `/api/rooms?room_id=${room_id}`;
        fetch(url).then((res) => res.json())
            .then((data) => {
                if (data && data.length > 0) {
                    setRoom(data[0]);
                } else {
                    setRoom(null);
                }
            })
            .catch((err) => {
                console.error(err);
                setRoom(null);
            });
    }, [room_id]);

    useEffect(() => {
        let url = `/api/user/reservation?room_id=${room_id}&date=${date.format('YYYY-MM-DD')}`;
        fetch(url).then((res) => res.json())    
            .then((data) => {
                setReservations(data.map((resv: Dict) => {
                    return {
                        ...resv,
                        start_time: time(resv.start_time),
                        end_time: time(resv.end_time),
                    };
                }));
            })
            .catch((err) => {
                console.error(err);
            });
    }, [room_id, date]);

    useEffect(() => {
        fetch('/api/settings?id=2')
            .then((res) => res.json())
            .then((data) => {
                setMaxTime(time(data[0].value).diff(time('00:00'), 'second'))
            })
            .catch((err) => {
                console.error(err);
            });

        fetch('/api/settings?id=1')
            .then((res) => res.json())
            .then((data) => {
                let time_window = time(data[0].value).diff(time('00:00'), 'day');
                setDates(Array.from({ length: time_window }, (_, i) => {
                    return dayjs().add(i, 'day');
                }));
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
        let _msg = { ...msg };
        delete _msg.snackbar;
        SetMsg(_msg);
    };

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        SetMsg({});
        if (!start || !end) {
            SetMsg({ snackbar: { message: '请选择时间段', severity: 'error' } });
            return;
        }
        let start_time = `${date.format('YYYY-MM-DD')} ${start.time.format('HH:mm')}`;
        let end_time = `${date.format('YYYY-MM-DD')} ${end.time.format('HH:mm')}`;
        const data = new FormData(event.currentTarget);
        let title = data.get('title');
        let note = data.get('note');
        let url = `/api/user/reservation`;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                include: 'credentials',
            },
            body: JSON.stringify({
                room_id,
                title,
                note,
                time_slots: [{ start_time, end_time }],
            }),
        }).then((res) => {
            if (res.ok) {
                SetMsg({ snackbar: { message: '预约成功', severity: 'success' } });
                setStart(null);
                setEnd(null);
            } else {
                res.json().then((data) => {
                    SetMsg({ snackbar: { message: data.message, severity: 'error' } });
                });
            }
        }).catch((err) => {
            console.error(err);
            SetMsg({ snackbar: { message: '预约失败', severity: 'error' } });
        });
    }

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

    const ToggleButtonsSkeleton = () => (
        <Skeleton
            width="100%"
            height={70}
            variant="rectangular"
            component="div"
            animation="wave"
        />
    );

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <ToggleButtonGroup 
                fullWidth
                color="primary"
                value={date.format('YYYY-MM-DD')} 
                exclusive 
                onChange={(e, value) => { 
                    if (value) {
                        setDate(dayjs(value));
                    }
                }}
                sx={{
                    margin: 'auto'
                }}
            >
                {dates.length? dates.map((date) => {
                    return (
                        <ToggleButton
                            key={date.format('YYYY-MM-DD')}
                            value={date.format('YYYY-MM-DD')}
                        >
                            <Box>
                            <Typography
                                variant='body2'
                            >
                                {date.format('ddd')}
                            </Typography>
                            <Typography
                                variant='caption'
                            >
                                {date.format('MMMDD')}
                            </Typography>
                            </Box>
                        </ToggleButton>
                    );
                }) : <ToggleButtonsSkeleton />}
            </ToggleButtonGroup>
            <Box 
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                {room ? <RoomView
                    periods={periods}
                    date={date}
                    room={room}
                    show_pending={true}
                /> : <RoomSkeleton />}
            </Box>
            <BookTime
                periods={periods}
                reservations={reservations}
                max_time={max_time}
                start={start}
                end={end}
                setStart={setStart}
                setEnd={setEnd}
            />
            <TextField
                id="title"
                name="title"
                label="预约标题"
                variant="standard"
                fullWidth
                required
            />
            <TextField
                id="note"
                name="note"
                label="备注"
                variant="standard"
                fullWidth
                multiline
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                提交
            </Button>
            <Snackbar open={msg.snackbar !== undefined} autoHideDuration={6000} onClose={handleClose}>
                <Alert severity={msg.snackbar?.severity} sx={{ width: '100%' }}>
                    {msg.snackbar?.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

interface Option {
    index: number;
    time: Dayjs;
}

const optionEqual = (a: Option, b: Option) => {
    return a.index === b.index && a.time.isSame(b.time);
};

interface BookTimeProps {
    periods: Period[];
    reservations: Reservation[];
    max_time: number; // seconds
    start: Option | null;
    setStart: (start: Option | null) => void;
    end: Option | null;
    setEnd: (end: Option | null) => void;
}

function BookTime(props: BookTimeProps) {
    const { periods, reservations, max_time, start, setStart, end, setEnd } = props;
    const [filteredPeriods, setFilteredPeriods] = useState<Period[]>([]);
    const [start_options, setStartOptions] = useState<Option[]>([]);
    const [end_options, setEndOptions] = useState<Option[]>([]);

    const get_options = (periods: Period[], t: "start" | "end") => {
        return periods.map((period, i) => {
            return {
                index: i,
                time: t === "start" ? period.start_time : period.end_time,
            };
        });
    };

    const isBeetwen = (t: Dayjs, t1: Dayjs, t2: Dayjs) => {
        return t.isAfter(t1) && t.isBefore(t2);
    };

    useEffect(() => {
        // filter periods already booked(in reservations)
        const filteredPeriods = periods.filter((period) => {
            return !reservations.some((resv) => {
                return (period.start_time.isSame(resv.start_time) && period.end_time.isSame(resv.end_time)) ||
                    isBeetwen(period.start_time, resv.start_time, resv.end_time) ||
                    isBeetwen(period.end_time, resv.start_time, resv.end_time);
            });
        });
        setFilteredPeriods(filteredPeriods);
    }, [periods, reservations]);

    useEffect(() => {
        // set start options
        let start_options = get_options(filteredPeriods, "start");
        let end_options = get_options(filteredPeriods, "end");
        setEndOptions(end_options);
        setStartOptions(start_options);
        setStart(null);
        setEnd(null);
    }, [filteredPeriods, setStart, setEnd]);

    return (
        <Box display="flex" width="100%">
            <Autocomplete
                fullWidth
                value={start}
                options={start_options}
                getOptionLabel={(option) => option.time.format('HH:mm')}
                isOptionEqualToValue={(option, value) => optionEqual(option, value)}
                renderInput={(params) => <TextField {...params} label="开始时间" variant="standard" />}
                onChange={(event, value) => {
                    setStart(value);
                    let end_options = [];
                    if (value) {
                        for (let i = value.index; i < filteredPeriods.length; i++) {
                            const period = filteredPeriods[i];
                            // ensure continuous time
                            if (i > value.index && !period.start_time.isSame(filteredPeriods[i - 1].end_time)) {
                                break;
                            }
                            if (period.end_time.diff(value.time, 'second') <= max_time) {
                                end_options.push({
                                    index: i,
                                    time: period.end_time,
                                });
                            } else {
                                break;
                            }
                        }
                    } else {
                        end_options = get_options(filteredPeriods, "end");
                    }
                    setEndOptions(end_options);
                }}
            />
            <Box>
                <Typography variant="h6" sx={{ margin: 2 }}>
                    ~
                </Typography>
            </Box>
            <Autocomplete
                fullWidth
                value={end}
                options={end_options}
                getOptionLabel={(option) => option.time.format('HH:mm')}
                isOptionEqualToValue={(option, value) => optionEqual(option, value)}
                renderInput={(params) => <TextField {...params} label="结束时间" variant="standard" />}
                onChange={(event, value) => {
                    setEnd(value);
                    let start_options = [];
                    if (value) {
                        for (let i = value.index; i >= 0; i--) {
                            const period = filteredPeriods[i];
                            // ensure continuous time
                            if (i < value.index && !period.end_time.isSame(filteredPeriods[i + 1].start_time)) {
                                break;
                            }
                            if (value.time.diff(period.start_time, 'second') <= max_time) {
                                start_options.push({
                                    index: i,
                                    time: period.start_time,
                                });
                            } else {
                                break;
                            }
                        }
                        start_options.reverse();
                    } else {
                        start_options = get_options(filteredPeriods, "start");
                    }
                    setStartOptions(start_options);
                }}
            />
        </Box>
    );
}

export default Reserve;