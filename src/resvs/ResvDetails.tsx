import React from "react";
import dayjs, { Dayjs } from "dayjs";
import {
    Box, 
    Button,
    Tooltip, 
    Skeleton, TextField, 
    Table, TableBody, TableCell, TableRow, TableHead, 
} from "@mui/material";

import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import HelpIcon from '@mui/icons-material/Help';

import { statusColors as resvStatusColors } from "./Resvs";
import { useSnackbar } from "../SnackbarProvider";
import { Link } from "../Navigate";
import { paths as api_paths, resv_status } from "../api";
import { labelFieldParams, descriptionFieldParams } from "../util";

interface ResvDetailsViewProps {
    resv_id: string;
    statusList: Record<string, any>[];
    mobile?: boolean;
}

function ResvDetails({ resv_id, statusList, mobile }: ResvDetailsViewProps) {
    const [resv, setResv] = React.useState<Record<string, any> | null>(null);
    const [room, setRoom] = React.useState<Record<string, any> | null>(null);
    const [privacy, setPrivacy] = React.useState<Record<number, any>>({});
    const [open, setOpen] = React.useState(false);
    const [slot_id, setSlotId] = React.useState<number | undefined>(undefined); // slot to cancel
    const { showSnackbar } = useSnackbar();

    const updateResv = React.useCallback(async () => {
        let res = await fetch(api_paths.user_resv + `?resv_id=${resv_id}`);
        let data = await res.json();
        if (data.length === 0) {
            setResv(null);
            showSnackbar({
                message: "Reservation not found",
                severity: "error",
            });
        } else {
            setResv({
                ...data[0],
                create_time: dayjs(data[0].create_time),
                slot_id: undefined,
                start_time: undefined,
                end_time: undefined,
                status: undefined,
                time_slots: data.map((item: any) => ({
                    slot_id: item.slot_id,
                    start_time: dayjs(item.start_time),
                    end_time: dayjs(item.end_time),
                    status: item.status,
                })),
            });
        }
    }, [resv_id, showSnackbar]);

    React.useEffect(() => {
        updateResv();
    }, [updateResv]);

    React.useEffect(() => {
        if (resv === null) {
            setRoom(null);
        } else {
            fetch(api_paths.rooms + `?room_id=${resv.room_id}`)
                .then(res => res.json())
                .then(data => {
                    setRoom(data[0]);
                });
        }
    }, [resv]);

    React.useEffect(() => {
        fetch(api_paths.resv_privacy)
            .then(res => res.json())
            .then(data => {
                setPrivacy(data.reduce((acc: Record<number, any>, item: any) => {
                    acc[item.privacy] = item;
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


        fetch(api_paths.user_resv + `/${resv_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({title, note}),
        }).then(res => {
            if (res.ok) {
                updateResv();
                showSnackbar({ message: "修改成功", severity: "success", duration: 2000 });
            } else {
                showSnackbar({ message: "修改失败", severity: "error" });
            }
        }).catch(err => {
            showSnackbar({ message: "修改失败", severity: "error" });
        });
    }

    const handleCancel = (slot_id?: number) => {
        console.log(slot_id);
        setOpen(true);
        setSlotId(slot_id);
    }

    const handleCancelConfirm = (confirm: boolean) => {
        setOpen(false);
        if (confirm) {
            updateResv();
        }
    }

    const formatTime = (time: Dayjs) => {
        return time.format("YYYY-MM-DD HH:mm");
    }

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                预约详情
            </Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>预约编号</TableCell>
                        <TableCell>房间</TableCell>
                        <TableCell>机密程度</TableCell>
                        <TableCell>创建时间</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>{resv_id}</TableCell>
                        <TableCell>
                            {room ? (
                                <Link to={`/rooms/${room?.room_id}`}>
                                    {room.name}
                                </Link>
                            ) : <Skeleton />}
                        </TableCell>
                        <TableCell>
                            {resv && privacy[resv.privacy] !== undefined ? (
                                <Box display="flex" alignItems="center">
                                    {privacy[resv.privacy]?.label ?? resv.privacy}
                                    {privacy[resv.privacy]?.description &&
                                    <Tooltip title={privacy[resv.privacy]?.description}>
                                        <HelpIcon fontSize="small" sx={{ ml: 1 }} />
                                    </Tooltip>}
                                </Box>
                            ) : <Skeleton />}
                        </TableCell>
                        <TableCell>
                            {resv ? (resv.create_time.format("YYYY-MM-DD HH:mm")) : <Skeleton />}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2 }}>
                预约时间
            </Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>时间编号</TableCell>
                        <TableCell>开始时间</TableCell>
                        <TableCell>结束时间</TableCell>
                        <TableCell>状态</TableCell>
                        <TableCell>操作
                            {resv && resv.time_slots.length > 1 && resv.time_slots.some((slot: any) => (
                                slot.status === resv_status.pending || slot.status === resv_status.confirmed
                                )) &&
                            <Chip
                                label="全部取消"
                                size="small"
                                color="error"
                                sx={{ ml: 1 }}
                                onClick={() => handleCancel()}
                                onDelete={() => handleCancel()}
                            />}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {resv ? resv.time_slots.map((slot: any) => (
                        <TableRow key={slot.slot_id}>
                            <TableCell>{slot.slot_id}</TableCell>
                            <TableCell>{formatTime(slot.start_time)}</TableCell>
                            <TableCell>{formatTime(slot.end_time)}</TableCell>
                            <TableCell>
                                {slot.status !== undefined ? (
                                    <Box display="flex" alignItems="center">
                                        <Box display="inline"
                                            borderBottom={3}
                                            borderColor={resvStatusColors[slot.status]}
                                        >
                                            {statusList[slot.status]?.label ?? slot.status}
                                        </Box>
                                        {statusList[slot.status]?.description &&
                                        <Tooltip title={statusList[slot.status]?.description}>
                                            <HelpIcon fontSize="small" sx={{ ml: 1 }} />
                                        </Tooltip>}
                                    </Box>
                                ) : <Skeleton />}
                            </TableCell>
                            <TableCell>
                                {slot.status === resv_status.pending || slot.status === resv_status.confirmed ? (
                                    <Chip
                                        label="取消"
                                        size="small"
                                        color="error"
                                        onClick={() => handleCancel(slot.slot_id)}
                                        onDelete={() => handleCancel(slot.slot_id)}
                                    />
                                ) : null}
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <Skeleton />
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {resv ?
            <TextField {...labelFieldParams} 
                id="title" name="title" label="标题" defaultValue={resv.title}/> :
            <Skeleton />}
            {resv ?
            <TextField {...descriptionFieldParams} 
                id="note" name="note" label="备注" defaultValue={resv.note} sx={{ mt: 2 }} /> :
            <Skeleton variant="rectangular" sx={{ mt: 2, height: 100 }} />}
            <Button  type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                保存
            </Button>
        </Box>
        <CancelResvDialog resv_id={resv_id} slot_id={slot_id} open={open} onClose={handleCancelConfirm} />
    </Box>
    );
}

interface CancelResvDialogProps {
    resv_id: number|string;
    slot_id?: number|string;
    open: boolean;
    onClose: (confirmed: boolean) => void;
}

const CancelResvDialog = ({ resv_id, slot_id, open, onClose }: CancelResvDialogProps) => {
    const { showSnackbar } = useSnackbar();

    const handleCancel = () => {
        let url = api_paths.user_resv + `/${resv_id}` + (slot_id !== undefined ? `/${slot_id}` : "");
        console.log(url);
        fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({status: resv_status.cancelled}),
        }).then(res => {
            if (res.ok) {
                showSnackbar({ message: "取消成功", severity: "success", duration: 2000 });
                onClose(true);
            } else {
                throw new Error("取消失败");
            }
        }).catch(err => {
            showSnackbar({ message: "取消失败", severity: "error" });
            onClose(false);
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
                <Button onClick={() => onClose(false)}>取消</Button>
                <Button onClick={handleCancel} color="error">确定</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ResvDetails;