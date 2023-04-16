import { useEffect, useState } from "react";
import { Dict, Period, Reservation, Room, RoomType, User } from "./types";
import { fetchPeriods, fetchTranslation, links as get_links, time } from "./util";
import { useNavigate, useParams } from "react-router-dom";
import Template from "./templates/AppbarDrawer";
import { Autocomplete, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, TableHead, TextField, Toolbar, Typography } from "@mui/material";
import EventSeatIcon from '@mui/icons-material/EventSeat';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Alert, Table, TableBody, TableCell, TableRow, Button } from "@mui/material";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import dayjs, { Dayjs } from "dayjs";
import weekday from 'dayjs/plugin/weekday';
import 'dayjs/locale/zh-cn'
import { ResvsView } from "./views/RoomsView";


dayjs.extend(weekday);
dayjs.locale('zh-cn');

interface RoomListViewProps {
    lang_code: string;
    type: RoomType;
    links: Dict;
    navigate: (path: string) => void;
}

function RoomListView(props: RoomListViewProps) {
    const { lang_code, type, links, navigate } = props;
    const [rooms, setRooms] = useState<Room[] | null>(null);

    useEffect(() => {
        fetchTranslation(`/api/rooms?type=${type.type}`, lang_code)
            .then((data) => {
                setRooms(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [lang_code, type]);

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
                                    navigate(`${links.reservation}/${room.room_id}`);
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

interface TableViewProps {
    lang_code: string;
    room: Room;
    periods: Period[];
}

function TableView(props: TableViewProps) {
    const { lang_code, room, periods } = props;
    const [currentWeek, setCurrentWeek] = useState(dayjs().weekday(0));

    // useEffect(() => {
    //     fetchTranslation(`/api/time_slots?room_id=${room.room_id}&date=${currentWeek.format("YYYY-MM-DD")}`, lang_code)


    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell> 
                            <Typography  noWrap>
                                日期
                            </Typography>
                        </TableCell>
                        {Array.from({ length: 7 }, (_, i) => i).map((i) => (
                            <TableCell key={i}>
                                <Typography  noWrap>
                                    {currentWeek.weekday(i).format("MMMDD")}
                                </Typography>
                                <Typography  noWrap variant="caption">
                                    {currentWeek.weekday(i).format("ddd")}
                                </Typography>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
            </Table>
        </>
    );
}

// interface RoomViewProps {
//     lang_code: string;
//     room_id: string;
// }


// function RoomView(props: RoomViewProps) {
//     const { lang_code, room_id } = props;
//     const [periods, setPeriods] = useState<Period[]>([]);
//     const [room, setRoom] = useState<Room | undefined | null>(undefined);

//     useEffect(() => {
//         fetchPeriods().then((data) => {
//             setPeriods(data);
//         }).catch((err) => {
//             console.error(err);
//         });

//         fetchTranslation(`/api/rooms?room_id=${room_id}`, lang_code)
//             .then((data) => {
//                 if (data && data.length > 0) {
//                     setRoom(data[0]);
//                 } else {
//                     setRoom(null);
//                 }
//             })
//             .catch((err) => {
//                 console.error(err);
//                 setRoom(null);
//             });
//     }, [lang_code, room_id]);

//     if (room === undefined) {
//         return <p>Loading...</p>;
//     } else if (room === null) {
//         return <p>Room Not Found</p>;
//     } else {
//         return (
//             <Box>
//                 <Typography variant="h4" sx={{ m: 2 }} >
//                     {room.name}
//                 </Typography>
//                 <TableView lang_code={lang_code} room={room} periods={periods} />
//             </Box>
//         );
//     }
// }


// interface RoomViewProps {
//     lang_code: string;
//     room: string;
// }

// function RoomView(props: RoomViewProps) {
//     const { room, periods, lang_code, date } = props;
//     const [reservations, setReservations] = useState<Reservation[]>([]);

//     useEffect(() => {
//         const url = `/api/time_slots?room_id=${room.room_id}&date=${date.format('YYYY-MM-DD')}`;
//         fetchTranslation(url, lang_code)
//             .then((data) => {
//                 setReservations(data.map((resv: Dict) => {
//                     return {
//                         ...resv,
//                         start_time: time(resv.start_time),
//                         end_time: time(resv.end_time),
//                     };
//                 }));
//             })
//             .catch((err) => {
//                 console.error(err);
//             });
//     }, [room.room_id, lang_code, date]);

//     return (
//         <Box 
//             width={140} 
//             margin={1} 
//             border='1px solid #ccc' 
//             boxShadow='0 0 4px rgba(0,0,0,.1)'
//         >
//             <Typography
//                 fontSize='1em'
//                 textAlign='center'
//                 color='#1669b8'
//                 borderBottom='1px solid #ccc'
//             >
//                 {room.name}
//             </Typography>

//             <Typography
//                 component='div'
//                 fontSize='.8em'
//                 textAlign='center'
//                 color='#999'
//                 bgcolor='#f8f8f8'
//             >
//                 <EventSeatIcon fontSize='inherit' />{room.capacity}
//             </Typography>
//             <Box
//                 height={200}
//                 position="relative"
//                 bgcolor={'#f5f5f5'}
//             >
//                 <ResvsView 
//                     periods={periods} 
//                     reservations={reservations} 
//                     lang_code={lang_code}
//                 />
//             </Box>
//         </Box>
//     )
// }

interface Option {
    index: number;
    time: Dayjs;
}

interface BookTimeProps {
    periods: Period[];
    reservations: Reservation[];
    max_time: number; // seconds
}

function BookTime(props: BookTimeProps) {
    const { periods, reservations, max_time } = props;
    const [filteredPeriods, setFilteredPeriods] = useState<Period[]>([]);
    const [start, setStart] = useState<Option | null>(null);
    const [end, setEnd] = useState<Option | null>(null);
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
    }, [filteredPeriods]);

    return (
        <Box display="flex" width="100%">
            <Autocomplete
                fullWidth
                options={start_options}
                getOptionLabel={(option) => option.time.format('HH:mm')}
                renderInput={(params) => <TextField {...params} label="Start Time" variant="outlined" />}
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
            <Autocomplete
                fullWidth
                options={end_options}
                getOptionLabel={(option) => option.time.format('HH:mm')}
                renderInput={(params) => <TextField {...params} label="End Time" variant="outlined" />}
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

interface RoomBookProps {
    lang_code: string;
    room_id: string;
}

function RoomBook(props: RoomBookProps) {
    const { lang_code, room_id } = props;
    const [periods, setPeriods] = useState<Period[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [room, setRoom] = useState<Room | undefined | null>(undefined);
    const [date, setDate] = useState(dayjs());
    const [dates, setDates] = useState<Dayjs[]>([]);
    const [max_time, setMaxTime] = useState(0);

    useEffect(() => {
        fetchPeriods().then((data) => {
            setPeriods(data);
        }).catch((err) => {
            console.error(err);
        });
    }, []);

    useEffect(() => {
        fetchTranslation(`/api/rooms?room_id=${room_id}`, lang_code)
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
    }, [lang_code, room_id]);

    useEffect(() => {
        fetchTranslation(`/api/time_slots?room_id=${room_id}&date=${date.format('YYYY-MM-DD')}`, lang_code)
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
    }, [room_id, lang_code, date]);

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

    return (
        <Box sx={{
            // display: 'flex',
        }}>
            <ToggleButtonGroup 
                color="primary"
                value={date.format('YYYY-MM-DD')} 
                exclusive 
                onChange={(e, value) => { 
                    if (value) {
                        setDate(dayjs(value));
                    }
                }}
            >
                {dates.map((date) => {
                    return (
                        <ToggleButton
                            key={date.format('YYYY-MM-DD')}
                            value={date.format('YYYY-MM-DD')}
                            sx={{
                                width: 140,
                                height: 40,
                            }}
                        >
                            {date.format('ddd')}
                            {/* <br />
                            {date.format('DD/MM')} */}
                        </ToggleButton>
                    );
                })}
            </ToggleButtonGroup>
            {/* <TextField 
                    size='small' 
                    variant='outlined'
                    type='date'
                    value={date.format('YYYY-MM-DD')}
                    onChange={(e) => {
                        setDate(dayjs(e.target.value));
                    }}
                />
                <Box sx={{
                    height: 200,
                    width: 140,
                }}
                >
                    <ResvsView
                        periods={periods}
                        reservations={reservations}
                        lang_code={lang_code}
                    />
                </Box> */}
                {/* {periods.length > 0 && */}
                <BookTime
                    periods={periods}
                    reservations={reservations}
                    max_time={max_time}
                />
                {/* // } */}
        </Box>
    );
}

function Book({ strings }: { strings: Dict }) {
    const [user, setUser] = useState<User | undefined | null>(undefined);
    const [types, setTypes] = useState<RoomType[] | null>(null);
    const { room_id } = useParams();
    const navigate = useNavigate();
    let links: Dict;
    if (room_id) {
        links = get_links(strings.lang_code, `/reservation/${room_id}`);
    } else {
        links = get_links(strings.lang_code, '/reservation');
    }

    useEffect(() => {
        if (!room_id) {
            fetchTranslation('/api/room_types', strings.lang_code)
                .then((data) => {
                    setTypes(data);
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, [strings.lang_code, room_id]);

    let view: JSX.Element;
    if (user === undefined) {
        view = <p>Loading...</p>;
    } else if (user === null) {
        navigate('/login');
        view = <p>Redirecting...</p>;
    } else if (types === null) {
        view = <p>Loading...</p>;
    } else {
        view = (
            <>
                {types.map((type) => (
                    <Box key={type.type} sx={{ m: 2 }} >
                        <RoomListView 
                            lang_code={strings.lang_code} 
                            type={type} 
                            links={links}
                            navigate={navigate}
                        />
                    </Box>
                ))}
            </>
        )
    }

    return (
        <Template
            user={user}
            setUser={setUser}
            strings={strings}
            links={links}
            mainView={
                <Box>
                    <Toolbar />
                    <Box sx={{ m: 2 }} >
                        {room_id? (
                            <RoomBook
                                lang_code={strings.lang_code} 
                                room_id={room_id} 
                            />
                        ) : (
                            view
                        )}
                    </Box>
                </Box>
            }
        />
    );
}

export default Book;