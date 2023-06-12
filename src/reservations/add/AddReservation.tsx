import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
    Box,
    Button,
    ListItemText,
    TextField,
    Typography,
} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { useSnackbar } from "providers/SnackbarProvider";
import RoomList from "rooms/RoomList";
import { Link, useNavigate } from "utils/Navigate";
import { paths as api_paths, setting, user_role } from "utils/api";
import { descriptionFieldParams, labelFieldParams } from "utils/util";
import RoomWidget from "./RoomWidget";
import SelectDateTime from "./SelectDateTime";
import { useAuth } from 'providers/AuthProvider';

function AddReservation() {
    const { room_id } = useParams();
    if (room_id === undefined) {
        return <RoomList
            title="预约"
            link={(room: Record<string, any>) => `/reservations/add/${room.room_id}`}
        />;
    } else {
        return <AddReservationForm room_id={room_id} />;
    }
}

function AddReservationForm({ room_id }: { room_id: string|number }) {
    const [date, setDate] = useState(dayjs());
    const { showSnackbar } = useSnackbar();
    const { user } = useAuth();
    let navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        let start_time = `${date.format('YYYY-MM-DD')} ${data.get('start_time')}`;
        let end_time =   `${date.format('YYYY-MM-DD')} ${data.get('end_time')}`;
        let url = api_paths.user_resv;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                room_id,
                title: data.get('title'),
                note: data.get('note'),
                start_time, end_time,
            }),
        })
            .then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => {
                showSnackbar({ message: '预约成功', severity: 'success', duration: 2000 });
                navigate(`/reservations/${data.resv_id}`);
            })
            .catch((err) => {
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
                <RoomWidget room_id={room_id} date={date} />
            </Box>
            <SelectDateTime date={date} setDate={setDate} room_id={room_id} />
            <TextField {...labelFieldParams} id="title" name="title" label="预约标题" />
            <TextField {...descriptionFieldParams} id="note" name="note" label="备注" sx={{ mt: 2 }} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                提交
            </Button>
            {user && user.role >= user_role.basic &&
            <Button  fullWidth variant="text" sx={{ mt: 3, mb: 2 }}
                endIcon={<NavigateNextIcon />}
                component={Link} to={`/reservations/add/advanced/${room_id}`}
            >
                高级预约选项
            </Button>}
        </Box>
    );
}

export function MaxDailyDialog() {
    const [max_daily, setMaxDaily] = useState<number|undefined>(undefined);
    const [today_count, setTodayCount] = useState<number|undefined>(undefined);
    const [open, setOpen] = useState(false);
    let navigate = useNavigate();
    let location = useLocation();

    
    let from = location.state?.from || "/";

    useEffect(() => {
        fetch(api_paths.settings + `?id=${setting.maxDaily}`)
            .then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => setMaxDaily(Number(data[0].value)))
            .catch((err) => {
                console.log(err);
                setMaxDaily(0);
            });
    }, []);

    useEffect(() => {
        let today = dayjs().format('YYYY-MM-DD');
        fetch(api_paths.user_resv + `?create_date=${today}`)
            .then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => {
                let set = new Set();
                for (let resv of data) {
                    set.add(resv.resv_id);
                }
                setTodayCount(set.size);
            })
            .catch((err) => {
                console.log(err);
                setTodayCount(0);
            });
    }, []);

    useEffect(() => {
        setOpen(max_daily !== undefined && today_count !== undefined && today_count >= max_daily);
    }, [max_daily, today_count]);

    const Text = () => {
        if (today_count === undefined || max_daily === undefined) {
            return <>正在加载...</>;
        } else if (today_count < max_daily) {
            return <>今日已预约 {today_count} 个，上限 {max_daily} 个</>;
        } else {
            return <>今日预约已达上限，上限 {max_daily} 个</>;
        }
    }

    return (<><Text />
        <Dialog open={open}>
            <DialogTitle>预约失败</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    今日预约已达上限
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>关闭</Button>
                <Button onClick={() => navigate(from)} autoFocus>返回</Button>
            </DialogActions>
        </Dialog>
    </>);
}

export default AddReservation;