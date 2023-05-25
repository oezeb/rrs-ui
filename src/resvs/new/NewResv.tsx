import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
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
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import dayjs from "dayjs";

import { useSnackbar } from "../../SnackbarProvider";
import RoomView from "../RoomView";
import SelectDateTime from "./SelectDateTime";
import { RoomList } from "../../rooms/Rooms";
import { Link, useNavigate } from "../../Navigate";
import { paths as api_paths, room_status, setting } from "../../api";
import { descriptionFieldParams, labelFieldParams } from "../../util";

function NewResv() {
    const [types, setTypes] = useState<Record<string, any>[]>([]);
    const [searchParams] = useSearchParams();

    const room_id = searchParams.get("room_id");

    useEffect(() => {
        if (room_id === null) {
            fetch(api_paths.room_types)
                .then((res) => res.json())
                .then((data) => {
                    setTypes(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [room_id]);

    if (room_id !== null) {
        return  <Book room_id={room_id} />;
    } else {
        return (<>
            {types.map((type) => (
                <RoomList key={type.type} 
                    type={type} 
                    link={(room) => `/reservations/new?room_id=${room.room_id}`}
                    disabled={(room) => room.status !== room_status.available}
                />
            ))}
        </>
        );
    }
}

function Book({ room_id }: { room_id: string }) {
    const [date, setDate] = useState(dayjs());
    const { showSnackbar } = useSnackbar();
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
            .then((res) => {
                if (res.ok) {
                    showSnackbar({ message: '预约成功', severity: 'success', duration: 2000 });
                    res.json().then((data) => {
                        navigate(`/reservations?id=${data.resv_id}`);
                    });
                } else {
                    throw new Error("预约失败")
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
            <SelectDateTime date={date} setDate={setDate} room_id={room_id} />
            <TextField {...labelFieldParams} id="title" name="title" label="预约标题" />
            <TextField {...descriptionFieldParams} id="note" name="note" label="备注" sx={{ mt: 2 }} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                提交
            </Button>
            <Button  fullWidth variant="text" sx={{ mt: 3, mb: 2 }}
                endIcon={<NavigateNextIcon />}
                component={Link} to={`/reservations/advanced?room_id=${room_id}`}
            >
                高级预约选项
            </Button>
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
            .then((res) => res.json())
            .then((data) => {
                setMaxDaily(Number(data[0].value));
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        let today = dayjs().format('YYYY-MM-DD');
        fetch(api_paths.user_resv + `?create_date=${today}`)
            .then((res) => res.json())
            .then((data) => {
                let set = new Set();
                for (let resv of data) {
                    set.add(resv.resv_id);
                }
                setTodayCount(set.size);
            })
            .catch((err) => {
                console.log(err);
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

export default NewResv;