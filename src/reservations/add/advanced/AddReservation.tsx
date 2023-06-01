import HelpIcon from '@mui/icons-material/Help';
import {
    Box,
    Button,
    ListItem,
    ListItemText,
    TextField,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import BackDrop from "utils/BackDrop";
import { useSnackbar } from "providers/SnackbarProvider";
import { useNavigate } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { descriptionFieldParams, labelFieldParams } from "utils/util";
import Repeat, { RepeatType } from "./Repeat";
import SelectDateTime from "./SelectDateTime";
import SlotTable from "./SlotTable";
import RoomList from 'rooms/RoomList';
import RoomView from 'reservations/add/RoomView';

function AddReservation() {
    const { room_id } = useParams();
    if (room_id === undefined) {
        return <RoomList
            title="高级预订"
            link={(room: Record<string, any>) => `/reservations/advanced/add/${room.room_id}`}
        />;
    } else {
        return <AddReservationForm room_id={room_id} />;
    }
}

function AddReservationForm({ room_id }: { room_id: string|number }) {
    const [session, setSession] = useState<Record<string, any>|null|undefined>(undefined);
    
    const today = dayjs();
    const [date, setDate] = useState(dayjs());
    const [slots, setSlots] = useState<Record<string, any>[]>([]);
    const [repeatType, setRepeatType] = useState<RepeatType>("none");
    const [conflicts, setConflicts] = useState<Record<string, any>[]|undefined>(undefined);
    const [validSlots, setValidSlots] = useState<Record<string, any>[]>([]);

    const { showSnackbar } = useSnackbar();
    let navigate = useNavigate();

    useEffect(() => {
        fetch(api_paths.sessions + `?is_current=true`)
            .then((res) => res.json())
            .then((data) => {
                if (data.length > 0) {
                    setSession({
                        ...data[0],
                        start_time: dayjs(data[0].start_time),
                        end_time: dayjs(data[0].end_time),
                    });
                } else {
                    throw new Error();
                }
            })
            .catch((err) => {
                console.log(err);
                setSession(null);
            });
    }, []);

    useEffect(() => {
        if (repeatType === "none") {
            setValidSlots(slots);
        } 
    }, [repeatType, slots]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (session === undefined || session === null) return;

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
            room_id,
            session_id: session.session_id,
            title: data.get('title'),
            note: data.get('note'),
            time_slots: validSlots.map((slot) => ({
                start_time: slot.start_time.format('YYYY-MM-DD HH:mm:ss'),
                end_time: slot.end_time.format('YYYY-MM-DD HH:mm:ss'),
            })),
        }

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
                        navigate(`/reservations/${data.resv_id}`);
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
    };

    if (session === null || (session !== undefined && (!session.is_current || session.end_time.isBefore(today)))) {
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

export default AddReservation;