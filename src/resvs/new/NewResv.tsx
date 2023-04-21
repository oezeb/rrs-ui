import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { 
    Box, 
    TextField,
    Typography,
    ListItemText,
} from "@mui/material";
import { Button } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import dayjs from "dayjs";

import { RoomStatus, Setting, time } from "../../util";
import { useSnackbar } from "../../SnackbarProvider";
import RoomView from "../RoomView";
import SelectDateTime, { Option } from "./SelectDateTime";
import { RoomList } from "../../rooms/Rooms";

function NewResv() {
    const [types, setTypes] = useState<Record<string, any>[]>([]);
    const [searchParams] = useSearchParams();

    const room_id = searchParams.get("room_id");

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

    if (room_id) {
        return  <Book room_id={room_id} />;
    } else {
        return (<>
            {types.map((type) => (
                <RoomList key={type.type} 
                    type={type} 
                    link={(room) => `/reservations/new?room_id=${room.room_id}`} 
                    disabled={(room) => room.status !== RoomStatus.available}
                />
            ))}
        </>
        );
    }
}

function Book({ room_id }: { room_id: string }) {
    const [start, setStart] = useState<Option|null>(null);
    const [end, setEnd] = useState<Option|null>(null);
    const [date, setDate] = useState(dayjs());
    const { showSnackbar } = useSnackbar();
    let navigate = useNavigate();

    const formatDateTime = (date: dayjs.Dayjs, time: dayjs.Dayjs) => {
        return `${date.format('YYYY-MM-DD')} ${time.format('HH:mm')}`;
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!start || !end) {
            showSnackbar({ message: '请选择时间段', severity: 'error' });
            return;
        }
        let start_time = formatDateTime(date, start.time);
        let end_time = formatDateTime(date, end.time);
        const data = new FormData(event.currentTarget);
        let url = `/api/user/reservation`;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                room_id,
                title: data.get('title'),
                note: data.get('note'),
                time_slots: [{ start_time, end_time }],
            }),
        }).then((res) => {
            if (res.ok) {
                showSnackbar({ message: '预约成功', severity: 'success', duration: 2000 });
                setStart(null);
                setEnd(null);
                res.json().then((data) => {
                    navigate(`/reservations?id=${data.resv_id}`);
                });
            } else {
                res.json().then((data) => {
                    console.log(data);
                });
                showSnackbar({ message: '预约失败', severity: 'error' });   
            }
        }).catch((err) => {
            console.error(err);
            showSnackbar({ message: '预约失败', severity: 'error' });
        });
    }

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <ListItemText secondary={<MaxDailyDialog />}>
                <Typography variant="h5" component="h2" gutterBottom>
                    预约
                </Typography>
            </ListItemText>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <RoomView room_id={room_id} date={date} />
            </Box>
            <SelectDateTime date={date} setDate={setDate} room_id={room_id}
                startOption={start} endOption={end}
                setStartOption={setStart} setEndOption={setEnd}
            />
            <TextField fullWidth required variant="standard"
                id="title" name="title" label="预约标题"
            />
            <TextField fullWidth multiline variant="standard"
                id="note" name="note" label="备注"
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                提交
            </Button>
        </Box>
    );
}

function MaxDailyDialog() {
    const [max_daily, setMaxDaily] = useState<number|undefined>(undefined);
    const [today_count, setTodayCount] = useState<number|undefined>(undefined);
    let navigate = useNavigate();
    let location = useLocation();

    
    let from = location.state?.from?.pathname || "/";

    useEffect(() => {
        fetch(`/api/settings?id=${Setting.maxDaily}`) 
            .then((res) => res.json())
            .then((data) => {
                setMaxDaily(Number(data[0].value));
            })
            .catch((err) => {
                console.log(err);
            });
    
    }, []);

    useEffect(() => {
        fetch('/api/user/reservation/today').then((res) => res.json())
            .then((data) => {
                setTodayCount(data.length);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const open = max_daily !== undefined && today_count !== undefined && today_count >= max_daily;

    return (
        <>今日已预约 {today_count} 个，上限 {max_daily} 个
        <Dialog open={open}>
            <DialogTitle>预约失败</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    今日预约已达上限
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => navigate(from)}>返回</Button>
            </DialogActions>
        </Dialog>
        </>
    );
}

export default NewResv;