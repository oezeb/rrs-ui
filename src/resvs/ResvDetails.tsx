import React from "react";
import dayjs, { Dayjs } from "dayjs";
import {
    List, ListItem, Box, 
    Button,
    Tooltip, 
    IconButton, 
    Skeleton, TextField 
} from "@mui/material";

import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { Link } from "react-router-dom";

import { statusColors as resvStatusColors } from "./Resvs";
import { useSnackbar } from "../SnackbarProvider";
import { ResvStatus } from "../util";

interface ResvDetailsViewProps {
    resv_id: string;
    statusList: Record<string, any>[];
    mobile?: boolean;
}

function ResvDetails({ resv_id, statusList, mobile }: ResvDetailsViewProps) {
    const [resv, setResv] = React.useState<Record<string, any> | null>(null);
    const [room, setRoom] = React.useState<Record<string, any> | null>(null);
    const [secuLevels, setSecuLevels] = React.useState<Record<number, any>>({});
    const [open, setOpen] = React.useState(false);
    const { showSnackbar } = useSnackbar();

    React.useEffect(() => {
        fetch(`/api/user/reservation?resv_id=${resv_id}`)
            .then(res => res.json())
            .then(data => {
                setResv({
                    ...data[0],
                    start_time: undefined,
                    end_time: undefined,
                    time_slots: data.map((item: any) => ({
                        start_time: dayjs(item.start_time),
                        end_time: dayjs(item.end_time),
                    })),
                });
            });
    }, [resv_id]);

    React.useEffect(() => {
        if (resv === null) {
            setRoom(null);
        } else {
            fetch(`/api/rooms?room_id=${resv.room_id}`)
                .then(res => res.json())
                .then(data => {
                    setRoom(data[0]);
                });
        }
    }, [resv]);

    React.useEffect(() => {
        fetch(`/api/resv_secu_levels`)
            .then(res => res.json())
            .then(data => {
                setSecuLevels(data.reduce((acc: Record<number, any>, item: any) => {
                    acc[item.secu_level] = item;
                    return acc;
                }, {}));
            });
    }, []);

        
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let data = new FormData(event.currentTarget);
        
        let title = data.get("title");
        let note = data.get("note");

        if (resv && title === resv.title && note === resv.note) {
            showSnackbar({ message: "未修改", severity: "info" });
            return;
        }

        fetch(`/api/user/reservation`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                resv_id: resv_id, 
                data: { title, note },
            }),
        }).then(res => {
            if (res.ok) {
                setResv({
                    ...resv, title, note,
                });
                showSnackbar({ message: "修改成功", severity: "success", duration: 2000 });
            } else {
                showSnackbar({ message: "修改失败", severity: "error" });
            }
        }).catch(err => {
            showSnackbar({ message: "修改失败", severity: "error" });
        });
    }

    const ListItemView = ({ label, value, divider, icon, onClick }:
        { label: string, value?: JSX.Element|string, divider?: boolean, icon?: React.ReactNode, onClick?: () => void }) => (
        <ListItem dense divider={divider}>
            <ListItemText>
                <Box sx={{ display: 'flex' }}>
                    <Typography variant="body1" fontWeight="bold">{label}:</Typography>
                    <Typography component="div" variant="body1" flexGrow={1} sx={{ ml: 1 }}>
                        {value? value : <Skeleton />}
                    </Typography>
                </Box>
            </ListItemText>
            <ListItemIcon>
                <IconButton onClick={onClick}>
                    {icon}
                </IconButton>
            </ListItemIcon>
        </ListItem>
    );

    const formatTime = (time: Dayjs) => {
        return time.format("YYYY/MM/DD HH:mm");
    }

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <ListItem divider dense>
                <Typography variant="h5" component="h2" gutterBottom>
                    预约详情
                </Typography>
            </ListItem>
            <List>
                <ListItemView label="编号" value={resv?.resv_id} />
                <ListItemView label="标题" value={resv ? (
                    <TextField required fullWidth variant="standard" id="title" name="title"
                        size="small" defaultValue={resv.title}
                        onChange={(e) => {}}
                    />
                ) : <Skeleton />} />
                <ListItemView label="状态" value={resv && statusList[resv.status] !== undefined ? (
                    <><Tooltip title={statusList[resv.status]?.description}>
                        <Box display="inline"
                            borderBottom={3}
                            borderColor={resvStatusColors[resv.status]}
                        >
                            {statusList[resv.status]?.label ?? resv.status}
                        </Box>
                    </Tooltip>
                    {resv.status === ResvStatus.pending || resv.status === ResvStatus.confirmed ? (
                        <Chip 
                            label="取消预约" color="error" 
                            size="small" sx={{ ml: 1 }}
                            onClick={() => { setOpen(true); }}
                            onDelete={() => { setOpen(true); }}
                         />
                    ) : null}
                    </>
                ) : <Skeleton />} />
                <ListItemView label="房间" value={room?.name} 
                    icon={room && <IconButton component={Link} to={`/rooms/${room?.room_id}`} ><NavigateNextIcon /></IconButton>}
                />
                <ListItemView label="机密程度" value={secuLevels[resv?.secu_level]?.label} />
                <ListItemView label="时间" value={resv ? (
                    <Typography variant="body1" sx={{ ml: 1 }}>
                        {formatTime(resv.time_slots[0].start_time)}
                        {mobile ? <br /> : " 至 "}
                        {formatTime(resv.time_slots[0].end_time)}
                    </Typography>
                ) : <Skeleton sx={{ flexGrow: 1 }} />} />
                <ListItemView label="备注" value={resv ? (
                    <TextField multiline minRows={3} maxRows={5} fullWidth id="note" name="note"
                        size="small" defaultValue={resv.note}
                        onChange={(e) => {}}
                    />
                ) : <Skeleton variant="rectangular" height={80} />} />
        </List>
        <Button  type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            保存
        </Button>
        <CancelResvDialog resv_id={resv_id} open={open} onClose={(confirmed) => {
            if (confirmed) {
                setResv({
                    ...resv, status: ResvStatus.cancelled,
                });
            }
            setOpen(false);
        }} />
    </Box>
    );
}

const CancelResvDialog = ({ resv_id, open, onClose }: { resv_id: string, open: boolean, onClose: (confirmed?: boolean) => void }) => {
    const { showSnackbar } = useSnackbar();

    const handleCancel = () => {
        fetch(`/api/user/reservation`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                resv_id: resv_id,
                data: { status: ResvStatus.cancelled },
            }),
        }).then(res => {
            if (res.ok) {
                showSnackbar({ message: "取消成功", severity: "success", duration: 2000 });
                onClose(true);
            } else {
                showSnackbar({ message: "取消失败", severity: "error" });
            }
        }).catch(err => {
            showSnackbar({ message: "取消失败", severity: "error" });
        });
    }

    return (
        <Dialog open={open}>
            <DialogTitle>取消预约</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    确定要取消预约吗？
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>取消</Button>
                <Button onClick={handleCancel} color="error">确定</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ResvDetails;