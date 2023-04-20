import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useLocation, useNavigate } from "react-router-dom";
import { Dayjs } from "dayjs";

import HomeRoomView, { RoomSkeleton } from "../home/RoomView";

interface RoomViewProps {
    room_id: string;
    periods: Record<string, any>[];
    date: Dayjs;
}

function RoomView(props: RoomViewProps) {
    const { room_id, periods, date } = props;
    const [room, setRoom] = useState<Record<string, any> | null>(null);
    let navigate = useNavigate();
    let location = useLocation();

    let from = location.state?.from?.pathname || "/";

    useEffect(() => {
        let url = `/api/rooms?room_id=${room_id}`;
        fetch(url).then((res) => res.json())
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
        return (
            <>
                <HomeRoomView periods={periods} date={date} 
                    room={room} show_pending={true} 
                />
                <Dialog open={room !== undefined && room.status === 0}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title" >预约失败</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            该房间暂时不可预订
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => navigate(from)} autoFocus>返回</Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    } else {
        return <RoomSkeleton />;
    }
}

export default RoomView;