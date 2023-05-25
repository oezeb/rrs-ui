import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
    Box, 
    TextField,
    Typography,
    ListItemText,
    ListItem,
} from "@mui/material";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import HelpIcon from '@mui/icons-material/Help';

import { useSnackbar } from "../../SnackbarProvider";
import RoomView from "../RoomView";
import { RoomList } from "../../rooms/Rooms";
import { useNavigate } from "../../Navigate";
import { paths as api_paths, room_status } from "../../api";
import { descriptionFieldParams, labelFieldParams } from "../../util";
import { BackDrop } from "../../App";
import SelectDateTime from "./SelectDateTime";
import SlotTable from "./SlotTable";
import Repeat, { RepeatType } from "./Repeat";

function NewResv() {
    const [types, setTypes] = useState<Record<string, any>[]>([]);
    const [session, setSession] = useState<Record<string, any>|null|undefined>(undefined);
    const [searchParams] = useSearchParams();

    const room_id = searchParams.get("room_id");

    useEffect(() => {
        if (room_id !== null) {
            let url = api_paths.room_types;
            fetch(url).then((res) => res.json())
                .then((data) => {
                    setTypes(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [room_id]);

    useEffect(() => {
        fetch(api_paths.sessions + `?is_current=true`)
            .then((res) => res.json())
            .then((data) => {
                if (data.length > 0) {
                    setSession(data[0]);
                } else {
                    setSession(null);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    if (session === undefined) {
        return <BackDrop />
    } else if (room_id !== null) {
        return  <Book room_id={room_id} session_id={session?.session_id} />;
    } else {
        return (<>
            {types.map((type) => (
                <RoomList key={type.type} 
                    type={type} 
                    link={(room) => `/reservations/advanced?room_id=${room.room_id}`}
                    disabled={(room) => room.status !== room_status.available}
                />
            ))}
        </>
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
                start_time: slot.start_time.format('YYYY-MM-DD HH:mm:ss'),
                end_time: slot.end_time.format('YYYY-MM-DD HH:mm:ss'),
            })),
        }

        console.log(resv);
        let url = `${api_paths.user_resv}/advanced`;
        fetch(url, {
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
                    res.json().then((data) => {
                        console.error(data);
                    });
                    throw new Error("预约失败")
                }
            }).catch((err) => {
                console.error(err);
                showSnackbar({ message: '预约失败', severity: 'error' });
            });
    }

    if (session === undefined) {
        return <BackDrop />;
    } else if (session === null || !session.is_current || session.end_time.isBefore(today)) {
        return (
            <Typography variant="h3" align="center" sx={{ mt: 10 }}>
                当前无可预约
            </Typography>
        );
    } else {
        return (
            <Box>
                <ListItem divider>
                    <ListItemText>
                        <Typography variant="h5" component="h2" gutterBottom>
                            高级预约<HelpIcon fontSize="small" color="disabled" /> {/* TODO: add help */}
                        </Typography>
                    </ListItemText>
                </ListItem>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <RoomView room_id={room_id} date={date} />
                </Box>
                <SelectDateTime
                    date={date} setDate={setDate}
                    room_id={room_id} session={session}
                    slots={slots} setSlots={(slots) => { setConflicts(undefined); setSlots(slots); }}
                />
                <SlotTable slots={slots} />
                <Repeat type={repeatType} setType={setRepeatType} room_id={room_id} session={session}
                    slots={slots} setValidSlots={setValidSlots} 
                    conflicts={conflicts} setConflicts={setConflicts}
                />
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField {...labelFieldParams} id="title" name="title" label="标题" />
                    <TextField {...descriptionFieldParams} id="note" name="note" label="备注" sx={{ mt: 2 }} />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        提交
                    </Button>
                </Box>
            </Box>
        );
    }
}

export default NewResv;