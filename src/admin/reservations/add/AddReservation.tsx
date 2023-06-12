import {
    Box,
    Button,
    ListItem,
    ListItemText,
    TextField,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";

import { useSnackbar } from "providers/SnackbarProvider";
import { useNavigate } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { descriptionFieldParams, labelFieldParams } from "utils/util";
import SelectTimeSlots from "./select-time-slots/SelectTimeSlots";
import RoomWidget from "./RoomWidget";
import SelectInfo from "./SelectInfo";
import { RoomWidgetSkeleton } from "home/room-widget/RoomWidget";

function AddResvervation() {
    const [room, setRoom] = useState<Record<string, any>|null|undefined>(undefined);
    const [session, setSession] = useState<Record<string, any>|null|undefined>(undefined);
    const [privacy, setPrivacy] = useState<Record<string, any>|null|undefined>(undefined);
    const [user, setUser] = useState<Record<string, any>|null|undefined>(undefined);
    const [slots, setSlots] = useState<Record<string, any>[]>([]);

    const [date, setDate] = useState(dayjs());

    const { showSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const handleSessionChange = (session: Record<string, any>|null|undefined) => {
        if (session === undefined || session === null) {
            setSession(session);
        } else {
            setSession({
                ...session,
                start_time: dayjs(session.start_time),
                end_time: dayjs(session.end_time),
            });
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (slots.length === 0) {
            showSnackbar({ message: '请先选择并添加时间段并检查冲突', severity: 'error' });
            return;
        }
        const data = new FormData(event.currentTarget);

        let resv = {
            room_id: room?.room_id,
            session_id: session?.session_id,
            privacy: privacy?.privacy,
            username: user?.username,
            title: data.get('title'),
            note: data.get('note'),
            time_slots: slots.map(slot => ({
                ...slot,
                start_time: slot.start_time.format('YYYY-MM-DD HH:mm:ss'),
                end_time: slot.end_time.format('YYYY-MM-DD HH:mm:ss'),
            })),
        };

        fetch(api_paths.admin.reservations, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resv),
        })
            .then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => {
                showSnackbar({ message: '预约成功', severity: 'success', duration: 2000 });
                navigate(`/admin/reservations/edit/${data.resv_id}/${data.username}`);
            })
            .catch((err) => {
                console.error(err);
                showSnackbar({ message: '预约失败', severity: 'error' });
            });
    };

    return (
        <Box sx={{ maxWidth: 700, margin: "auto" }} >
            <ListItem divider>
                <ListItemText>
                    <Typography variant="h5" component="h2" gutterBottom>
                        添加预订
                    </Typography>
                </ListItemText>
            </ListItem>
            <SelectInfo
                room={room} session={session} privacy={privacy} user={user}
                setRoom={setRoom} setSession={handleSessionChange} setPrivacy={setPrivacy} setUser={setUser}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {room ?
                <RoomWidget room_id={room.room_id} date={date} />:
                <RoomWidgetSkeleton />}
            </Box>
            <SelectTimeSlots
                date={date} setDate={setDate}
                room_id={room?.room_id??undefined}
                session={session??undefined}
                setSlots={setSlots}
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

export default AddResvervation;