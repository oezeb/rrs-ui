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
import RoomList from 'rooms/RoomList';
import RoomWidget from 'reservations/add/RoomWidget';
import Forbidden from 'utils/Forbidden';
import SelectTimeSlots from './SelectTimeSlots';

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
    const [slots, setSlots] = useState<Record<string, any>[]>([]);
    
    const [date, setDate] = useState(dayjs());

    const { showSnackbar } = useSnackbar();
    let navigate = useNavigate();

    useEffect(() => {
        fetch(api_paths.sessions + `?is_current=true`)
            .then((res) => res.json())
            .then((data) => {
                if (data.length === 0) throw new Error();

                let end_time = dayjs(data[0].end_time);
                if (dayjs().isAfter(end_time)) throw new Error();

                let start_time = dayjs(data[0].start_time);
                setSession({ ...data[0], start_time, end_time });
            })
            .catch((err) => {
                console.log(err);
                setSession(null);
            });
    }, []);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (session === undefined || session === null) return;
        if (slots.length === 0) {
            showSnackbar({ message: '请先选择并添加时间段并检查冲突', severity: 'error' });
            return;
        }

        const data = new FormData(event.currentTarget);

        let resv = {
            room_id,
            session_id: session.session_id,
            title: data.get('title'),
            note: data.get('note'),
            time_slots: slots.map((slot) => ({
                start_time: slot.start_time.format('YYYY-MM-DD HH:mm:ss'),
                end_time: slot.end_time.format('YYYY-MM-DD HH:mm:ss'),
            })),
        }

        fetch(`${api_paths.user_resv}/advanced`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resv),
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    res.json().then((data) => {
                        console.error(data);
                    });
                    throw new Error("预约失败")
                }
            })
            .then((data) => {
                showSnackbar({ message: '预约成功', severity: 'success', duration: 2000 });
                navigate(`/reservations/${data.resv_id}`);
            }) 
            .catch((err) => {
                console.error(err);
                showSnackbar({ message: '预约失败', severity: 'error' });
            });
    };

    if (session === null) {
        return <Forbidden text="当前无可预约" />;
    }

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
                <RoomWidget room_id={room_id} date={date} />
            </Box>
            {session &&
            <SelectTimeSlots
                date={date} setDate={setDate}
                room_id={room_id}
                session={session}
                setSlots={setSlots}
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

export default AddReservation;