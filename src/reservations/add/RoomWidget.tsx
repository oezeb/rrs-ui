import ErrorIcon from '@mui/icons-material/Error';
import { Box, Button } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import HomeRoomWidget, { RoomWidgetSkeleton } from 'home/room-widget/RoomWidget';
import { useNavigate } from "utils/Navigate";
import { paths as api_paths, room_status } from "utils/api";

interface RoomWidgetProps {
    room_id: string|number;
    date: Dayjs;
}

function RoomWidget(props: RoomWidgetProps) {
    const { room_id, date } = props;
    const [room, setRoom] = useState<Record<string, any> | null>(null);
    let navigate = useNavigate();
    let location = useLocation();

    let from = location.state?.from || "/";

    useEffect(() => {
        let url = api_paths.rooms + `?room_id=${room_id}`;
        fetch(url).then((res) => res.ok ? res.json() : Promise.reject(res))
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

    if (room) {
        return (<>
            <HomeRoomWidget date={date} room={room} show_pending={true} />
            <Dialog open={room !== undefined && room.status === room_status.unavailable}>
                <DialogTitle component={Box} sx={{ display: 'flex', alignItems: 'center' }} >
                    <ErrorIcon color="error" sx={{ mr: 1 }} />
                    错误
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        该房间暂时不可约，请选择其他房间。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => navigate(from)} autoFocus>
                        返回
                    </Button>
                </DialogActions>
            </Dialog>
        </>);
    } else {
        return <RoomWidgetSkeleton />;
    }
}

export default RoomWidget;