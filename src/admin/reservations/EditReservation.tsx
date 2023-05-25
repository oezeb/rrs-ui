import React from "react";
import dayjs, { Dayjs } from "dayjs";
import {
    Box, 
    Button,
    Tooltip, 
    Skeleton, TextField, 
    Table, TableBody, TableCell, TableRow, TableHead, FormControl, Select, MenuItem, IconButton, ListItemText, 
} from "@mui/material";

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import HelpIcon from '@mui/icons-material/Help';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CancelIcon from '@mui/icons-material/Cancel';

import { statusColors as resvStatusColors } from "../../resvs/Resvs";
import { useSnackbar } from "../../SnackbarProvider";
import { Link } from "../../Navigate";
import { paths as api_paths, resv_status } from "../../api";
import { labelFieldParams, descriptionFieldParams } from "../../util";
import { useSearchParams } from "react-router-dom";


function EditReservation() {
    const [searchParams] = useSearchParams();

    const resv_id = searchParams.get('resv_id');

    return (<>{resv_id &&
        <ResvDetails resv_id={resv_id}/>
    }</>);
}

interface ResvDetailsViewProps {
    resv_id: string;
    mobile?: boolean;
}

function ResvDetails({ resv_id, mobile }: ResvDetailsViewProps) {
    const [resv, setResv] = React.useState<Record<string, any> | null>(null);
    const [room, setRoom] = React.useState<Record<string, any> | null>(null);
    const [privacy, setPrivacy] = React.useState<Record<number, any>[]>([]);
    const [status, setStatus] = React.useState<Record<string, any>>({});
    const [users, setUsers] = React.useState<Record<string, any>>({});
    const [open, setOpen] = React.useState(false);
    const [slot_id, setSlotId] = React.useState<number | undefined>(undefined); // slot to cancel
    const { showSnackbar } = useSnackbar();

    const updateResv = React.useCallback(async () => {
        let res = await fetch(api_paths.admin.reservations + `?resv_id=${resv_id}`);
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
                setPrivacy(data);
            });
        fetch(api_paths.admin.resv_status)
            .then(res => res.json())
            .then(data => setStatus(data.reduce((acc: Record<string, any>, item: Record<string, any>) => {
                acc[item.status] = item;
                return acc;
            }, {})));
        fetch(api_paths.admin.users)
            .then(res => res.json())
            .then(data => setUsers(data.reduce((acc: Record<string, any>, item: Record<string, any>) => {
                acc[item.username] = item;
                return acc;
            }, {})));
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
    };

    const handleCancel = (slot_id?: number) => {
        console.log(slot_id);
        setOpen(true);
        setSlotId(slot_id);
    };

    const handleConfirm = (slot_id?: number) => {
        console.log(slot_id);
    };

    const handleReject = (slot_id?: number) => {
        console.log(slot_id);
    };

    const handleCancelConfirm = (confirm: boolean) => {
        setOpen(false);
        if (confirm) {
            updateResv();
        }
    };

    const formatTime = (time: Dayjs) => {
        return time.format("YYYY-MM-DD HH:mm");
    };

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
            预订详情
            </Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>预订号</TableCell>
                        <TableCell>用户</TableCell>
                        <TableCell>房间</TableCell>
                        <TableCell>机密程度</TableCell>
                        <TableCell>创建时间</TableCell>
                        <TableCell>更新时间</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>{resv_id}</TableCell>
                        <TableCell>{resv? users[resv.username]?.name : <Skeleton />}</TableCell>
                        <TableCell>
                            {room ? (
                                <Link to={`/rooms/${room?.room_id}`}>
                                    {room.name}
                                </Link>
                            ) : <Skeleton />}
                        </TableCell>
                        <TableCell>
                            {resv ? (
                                <FormControl variant="standard" size="small" >
                                    <Select name="privacy" defaultValue={resv.privacy}>
                                        {privacy.map((item: any) => (
                                            <MenuItem key={item.privacy} value={item.privacy}>
                                                {item.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : <Skeleton />}
                        </TableCell>
                        <TableCell>
                            {resv ? (resv.create_time.format("YYYY-MM-DD HH:mm")) : <Skeleton />}
                        </TableCell>
                        <TableCell>
                            {resv ? (resv.update_time?.format("YYYY-MM-DD HH:mm")) : <Skeleton />}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <ListItemText secondary={<>
                <Typography variant="caption" component="span" sx={{ mr: 2 }}>
                    <CancelIcon color="error" fontSize="inherit" sx={{ ml: 2, mr: 1 }} />
                    取消预约
                </Typography>
                <Typography variant="caption" component="span" sx={{ mr: 2 }}>
                    <ThumbUpIcon color="success" fontSize="inherit" sx={{ ml: 2, mr: 1 }} />
                    审核通过
                </Typography>
                <Typography variant="caption" component="span" sx={{ mr: 2 }}>
                    <ThumbDownIcon color="error" fontSize="inherit" sx={{ ml: 2, mr: 1 }} />
                    审核拒绝
                </Typography>
            </>}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2 }}>
                    预约时间
                </Typography>
            </ListItemText>
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
                            // <Chip
                            //     label="全部取消"
                            //     size="small"
                            //     color="error"
                            //     sx={{ ml: 1 }}
                            //     onClick={() => handleCancel()}
                            //     onDelete={() => handleCancel()}
                            // />
                            // <Button size="small"  color="error" startIcon={<CancelIcon fontSize="small"/>}>
                            //     全取消
                            // </Button>
                            <Tooltip title="全部取消">
                                <IconButton size="small"  color="error" onClick={() => handleCancel()}>
                                    <CancelIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                            }
                            {resv && resv.time_slots.length > 1 && resv.time_slots.some((slot: any) => (
                                slot.status === resv_status.pending
                                )) &&<>
                                {/* <Button size="small"  color="success" startIcon={<ThumbUpIcon fontSize="small"/>}>
                                    全审核通过
                                </Button>
                                <Button size="small"  color="error" startIcon={<ThumbDownIcon fontSize="small"/>}>
                                    全审核拒绝
                                </Button> */}
                                <Tooltip title="全部审核通过">
                                    <IconButton size="small"  color="success" onClick={() => handleConfirm()}>
                                        <ThumbUpIcon fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="全部审核拒绝">
                                    <IconButton size="small"  color="error" onClick={() => handleReject()}>
                                        <ThumbDownIcon fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            </>}
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
                                            {status[slot.status]?.label ?? slot.status}
                                        </Box>
                                        {status[slot.status]?.description &&
                                        <Tooltip title={status[slot.status]?.description}>
                                            <HelpIcon fontSize="small" sx={{ ml: 1 }} />
                                        </Tooltip>}
                                    </Box>
                                ) : <Skeleton />}
                            </TableCell>
                            <TableCell>
                                {slot.status === resv_status.pending || slot.status === resv_status.confirmed ? (
                                    // <Chip
                                    //     label="取消"
                                    //     size="small"
                                    //     color="error"
                                    //     onClick={() => handleCancel(slot.slot_id)}
                                    //     onDelete={() => handleCancel(slot.slot_id)}
                                    // />
                                    <IconButton color="error" size="small" onClick={() => handleCancel(slot.slot_id)}>
                                        <CancelIcon fontSize="small" />
                                    </IconButton>
                                ) : null}
                                {slot.status === resv_status.pending ? (<>
                                    {/* <Chip
                                        label="审核通过"
                                        size="small"
                                        color="success"
                                        sx={{ ml: 1 }}
                                        onClick={() => handleConfirm(slot.slot_id)}
                                        onDelete={() => handleConfirm(slot.slot_id)}
                                    />
                                    <Chip
                                        label="审核拒绝"
                                        size="small"
                                        color="error"
                                        sx={{ ml: 1 }}
                                        onClick={() => handleReject(slot.slot_id)}
                                        onDelete={() => handleReject(slot.slot_id)}
                                    /> */}
                                    <IconButton color="success" size="small" onClick={() => handleConfirm(slot.slot_id)}>
                                        <ThumbUpIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton color="error" size="small" onClick={() => handleReject(slot.slot_id)}>
                                        <ThumbDownIcon fontSize="small" />
                                    </IconButton>
                                </>) : null}
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

export default EditReservation;