import {
    Box,
    Button,
    FormControl,
    InputLabel,
    ListItem,
    ListItemText,
    ListSubheader,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import log from "loglevel";

import BackDrop from "utils/BackDrop";
import { useSnackbar } from "providers/SnackbarProvider";
import RoomView from "reservations/add/RoomView";
import Repeat, { RepeatType } from "reservations/add/advanced/Repeat";
import { useNavigate } from "utils/Navigate";
import { paths as api_paths, resv_privacy } from "utils/api";
import { descriptionFieldParams, labelFieldParams } from "utils/util";
import SelectDateTime from "./SelectDateTime";
import SlotTable from "./SlotTable";

function AddResvervation() {
    const [users, setUsers] = useState<Record<string, any>[]|undefined>(undefined);
    const [rooms, setRooms] = useState<Record<string, any>[]|undefined>(undefined);
    const [roomTypes, setRoomTypes] = useState<Record<string, any>[]|undefined>(undefined);
    const [resvPrivacy, setResvPrivacy] = useState<Record<string, any>[]|undefined>(undefined);
    const [sessions, setSessions] = useState<Record<string, any>[]|undefined>(undefined);
    
    const [room, setRoom] = useState<Record<string, any>|null|undefined>(undefined);
    const [session, setSession] = useState<Record<string, any>|null|undefined>(undefined);
    
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const get = async (path: string, setter: (data: any) => void) => {
            try {
                let res = await fetch(path);
                let data = await res.json();
                setter(data);
            } catch (err) {
                console.log(err);
            }
        }

        let promises = [
            get(api_paths.admin.users, setUsers),
            get(api_paths.admin.rooms, setRooms),
            get(api_paths.admin.room_types, setRoomTypes),
            get(api_paths.admin.resv_privacy, setResvPrivacy),
            get(api_paths.admin.sessions, setSessions),
        ];

        Promise.all(promises).then(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (rooms && rooms.length > 0) {
            setRoom(rooms[0]);
        } else {
            setRoom(null);
        }
        let session: any = sessions?.find((s) => s.is_current);
        if (session === undefined && sessions && sessions.length > 0) {
            session = sessions[0];
        } else if (session === undefined) {
            session = null;
        } 
        setSession(session);
    }, [rooms, sessions]);


    if (room === null || session === null) {
        return <Box>没有可用的房间或会话</Box>
    } else {
        return (
            <Box>
                <ListItem divider>
                    <ListItemText>
                        <Typography variant="h5" component="h2" gutterBottom>
                            添加预订
                        </Typography>
                    </ListItemText>
                </ListItem>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, justifyContent: "center" }}>
                    {rooms && roomTypes && 
                    <FormControl fullWidth>
                        <InputLabel>选择房间</InputLabel>
                        {room &&
                        <Select size="small" label="选择房间" value={room.room_id}>
                            {roomTypes.map((roomType) => {
                                let items = rooms.filter((room) => room.type === roomType.type).map((room) => (
                                    <MenuItem key={room.room_id} value={room.room_id}
                                        onClick={() => setRoom(room)}>
                                        {room.name}
                                    </MenuItem>
                                ));
                                return [
                                    <ListSubheader key={roomType.type}>{roomType.label}</ListSubheader>,
                                    ...items
                                ];
                            })}
                        </Select>}
                    </FormControl>}
                    {sessions && 
                    <FormControl fullWidth>
                        <InputLabel>选择会话</InputLabel>
                        {session &&
                        <Select size="small" label="选择会话" value={session.session_id}>
                            {sessions.map((session) => (
                                <MenuItem key={session.session_id} value={session.session_id}
                                    onClick={() => setSession(session)}>
                                    {session.name}
                                </MenuItem>
                            ))}
                        </Select>}
                    </FormControl>}
                    {resvPrivacy &&
                    <FormControl fullWidth>
                        <InputLabel>选择隐私</InputLabel>
                        <Select size="small" label="选择隐私设置" defaultValue={resv_privacy.public}>
                            {resvPrivacy.map((privacy) => (
                                <MenuItem key={privacy.privacy} value={privacy.privacy}>
                                    {privacy.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>}
                    {users &&
                    <FormControl fullWidth>
                        <InputLabel>选择用户</InputLabel>
                        <Select size="small" label="选择用户" defaultValue="">
                            {users.map((user) => (
                                <MenuItem key={user.username} value={user.username}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>}
                </Box>
                {room && session &&
                <Book 
                    room_id={room.room_id} 
                    session_id={session.session_id} 
                />}
                <BackDrop open={loading || room === undefined || session === undefined} />
            </Box>
        );
    }
}

interface BookProps {
    room_id: string|number;
    session_id?: string|number;
}

function Book({ room_id, session_id }: BookProps) {
    const today = dayjs();
    const [session, setSession] = useState<Record<string, any>|null|undefined>(undefined);
    const [date, setDate] = useState(dayjs());
    const [slots, setSlots] = useState<Record<string, any>[]>([]);
    const [repeatType, setRepeatType] = useState<RepeatType>("none");
    const [conflicts, setConflicts] = useState<Record<string, any>[]|undefined>(undefined);
    const [validSlots, setValidSlots] = useState<Record<string, any>[]>([]);

    const { showSnackbar } = useSnackbar();
    let navigate = useNavigate();

    useEffect(() => {
        if (session_id !== undefined) {
            fetch(api_paths.sessions + `?session_id=${session_id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.length > 0) {
                        setSession({
                            ...data[0],
                            start_time: dayjs(data[0].start_time),
                            end_time: dayjs(data[0].end_time),
                        });
                    } else {
                        setSession(null);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            setSession(null);
        }
    }, [session_id]);

    useEffect(() => {
        if (repeatType === "none") {
            setValidSlots(slots);
        } 
    }, [repeatType, slots]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if (repeatType !== "none" && conflicts === undefined) {
            showSnackbar({ message: '请先检查冲突', severity: 'error' });
            return;
        }
        if (validSlots.length === 0) {
            showSnackbar({ message: '请先选择并添加时间段', severity: 'error' });
            return;
        }

        let resv = {
            room_id, session_id,
            title: data.get('title'),
            note: data.get('note'),
            time_slots: validSlots.map((slot) => ({
                ...slot,
                start_time: slot.start_time.format('YYYY-MM-DD HH:mm:ss'),
                end_time: slot.end_time.format('YYYY-MM-DD HH:mm:ss'),
            })),
        }

        fetch(api_paths.admin.reservations, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resv),
        })
            .then((res) => {
                if (res.ok) {
                    showSnackbar({ message: '预约成功', severity: 'success', duration: 2000 });
                    res.json().then((data) => {
                        navigate(`/reservations?id=${data.resv_id}`);
                    });
                } else {
                    res.text().then((text) => {
                        throw new Error(text);
                    });
                }
            }).catch((err) => {
                console.error(err);
                showSnackbar({ message: '预约失败', severity: 'error' });
            });
    }

    if (session === null || (session !== undefined && (!session.is_current || session.end_time.isBefore(today)))) {
        return (
            <Typography variant="h3" align="center" sx={{ mt: 10 }}>
                当前无可预约
            </Typography>
        );
    } else {
        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <RoomView room_id={room_id} date={date} />
                </Box>
                {session &&
                <SelectDateTime
                    date={date} setDate={setDate}
                    room_id={room_id} session={session}
                    slots={slots} setSlots={(slots) => { setConflicts(undefined); setSlots(slots); }}
                />}
                <SlotTable slots={slots} />
                {session &&
                <Repeat type={repeatType} setType={setRepeatType} room_id={room_id} session={session}
                    slots={slots} setValidSlots={setValidSlots} 
                    conflicts={conflicts} setConflicts={setConflicts}
                />}
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField {...labelFieldParams} id="title" name="title" label="标题" />
                    <TextField {...descriptionFieldParams} id="note" name="note" label="备注" sx={{ mt: 2 }} />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        提交
                    </Button>
                </Box>
                <BackDrop open={session === undefined} />
            </Box>
        );
    }
}

export default AddResvervation;