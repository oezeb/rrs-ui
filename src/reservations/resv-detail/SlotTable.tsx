import {
    Box,
    IconButton, 
    Skeleton,
    Table, TableBody, TableCell,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material";
import { Dayjs } from "dayjs";
import React from "react";

import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Typography from '@mui/material/Typography';

import { resvStatusColors } from 'utils/util';
import { resv_status } from "utils/api";
import ResvActionDialog from "./ActionDialog";

export type Action = "cancel"|"accept"|"reject";

interface SlotTableProps {
    resv: Record<string, any>|undefined;
    setResv: React.Dispatch<React.SetStateAction<Record<string, any>|undefined>>;

    resv_status_url: string;
    action_url: string;

    allowedActions?: Action[];
}

function SlotTable(props : SlotTableProps) {
    const { resv_status_url, action_url, resv, setResv } = props;
    const [status, setStatus] = React.useState<Record<string, any>>({});
    const [slotId, setSlotId] = React.useState<number|string|undefined>(undefined);
    const [action, setAction] = React.useState<Action|undefined>(undefined);

    const allowedActions = new Set<Action>(props.allowedActions??["cancel", "accept", "reject"]);

    React.useEffect(() => {
        fetch(resv_status_url)
            .then(res => res.json())
            .then(data => setStatus(data.reduce((acc: Record<string, any>, item: Record<string, any>) => {
                acc[item.status] = item;
                return acc;
            }, {})));
    }, [resv_status_url]);

    const handleCancel = (slot_id?: number) => {
        if (allowedActions.has("cancel")) {
            setSlotId(slot_id);
            setAction("cancel");
        }
    };

    const handleConfirm = (slot_id?: number) => {
        if (allowedActions.has("accept")) {
            setSlotId(slot_id);
            setAction("accept");
        }
    };

    const handleReject = (slot_id?: number) => {
        if (allowedActions.has("reject")) {
            setSlotId(slot_id);
            setAction("reject");
        }
    };

    const formatTime = (time: Dayjs) => {
        return time.format("YYYY-MM-DD HH:mm");
    };

    const onActionDialogClose = (confirm: boolean) => {
        setAction(undefined);
        setSlotId(undefined);
        if (confirm) {
            setResv(undefined);
        }
    };

    const actions = (<>
        {resv && allowedActions.has("cancel") &&
        resv.time_slots.length > 1 && resv.time_slots.some((slot: any) => (
            slot.status === resv_status.pending || slot.status === resv_status.confirmed
            )) &&
        <Tooltip title="全部取消">
            <IconButton size="small"  color="error" onClick={() => handleCancel()}>
                <CancelIcon fontSize="inherit"/>
            </IconButton>
        </Tooltip>}
        {resv && resv.time_slots.length > 1 && resv.time_slots.some((slot: any) => (
            slot.status === resv_status.pending
            )) &&<>
            {allowedActions.has("accept") &&
            <Tooltip title="全部审核通过">
                <IconButton size="small"  color="success" onClick={() => handleConfirm()}>
                    <ThumbUpIcon fontSize="inherit"/>
                </IconButton>
            </Tooltip>}
            {allowedActions.has("reject") &&
            <Tooltip title="全部审核拒绝">
                <IconButton size="small"  color="error" onClick={() => handleReject()}>
                    <ThumbDownIcon fontSize="inherit"/>
                </IconButton>
            </Tooltip>}
        </>}
    </>)

    return (<>
        <Table size="small">
            <TableHead>
                <TableRow>
                    {["时间编号", "开始时间", "结束时间", "状态", <>操作{actions}</>]
                        .map((item, index) => (<TableCell key={index}>{item}</TableCell>))}
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
                                    <Box component="span"
                                        borderBottom={3}
                                        borderColor={resvStatusColors[slot.status]}
                                    >
                                        {status[slot.status]?.label ?? slot.status}
                                    </Box>
                                    {status[slot.status]?.description &&
                                    <Tooltip title={status[slot.status]?.description}>
                                        <HelpIcon fontSize="inherit" sx={{ ml: 1 }} />
                                    </Tooltip>}
                                </Box>
                            ) : <Skeleton />}
                        </TableCell>
                        <TableCell>
                            {allowedActions.has("cancel") &&
                            (slot.status === resv_status.pending || slot.status === resv_status.confirmed) ? (
                                <IconButton color="error" size="small" onClick={() => handleCancel(slot.slot_id)}>
                                    <CancelIcon fontSize="inherit" />
                                </IconButton>
                            ) : null}
                            {slot.status === resv_status.pending ? (<>
                                {allowedActions.has("accept") &&
                                <IconButton color="success" size="small" onClick={() => handleConfirm(slot.slot_id)}>
                                    <ThumbUpIcon fontSize="inherit" />
                                </IconButton>}
                                {allowedActions.has("reject") &&
                                <IconButton color="error" size="small" onClick={() => handleReject(slot.slot_id)}>
                                    <ThumbDownIcon fontSize="inherit" />
                                </IconButton>}
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
        {resv &&
        <ResvActionDialog 
            url={action_url} 
            resv_id={resv.resv_id} 
            slot_id={slotId} 
            action={action} 
            onClose={onActionDialogClose}
        />}
    </>);
}

interface ActionHelperProps {
    only?: Action[];
    exclude?: Action[];
};

export const ActionHelper = ({ only, exclude }: ActionHelperProps) => {
    const allowedActions = new Set<Action>(only ?? ["cancel", "accept", "reject"]);
    exclude?.forEach(action => allowedActions.delete(action));
    return (<>
        {allowedActions.has("cancel") &&
        <Typography variant="caption" component="span" sx={{ mr: 2 }}>
            <CancelIcon color="error" fontSize="inherit" sx={{ ml: 2, mr: 1 }} />
            取消预约
        </Typography>}
        {allowedActions.has("accept") &&
        <Typography variant="caption" component="span" sx={{ mr: 2 }}>
            <ThumbUpIcon color="success" fontSize="inherit" sx={{ ml: 2, mr: 1 }} />
            审核通过
        </Typography>}
        {allowedActions.has("reject") &&
        <Typography variant="caption" component="span" sx={{ mr: 2 }}>
            <ThumbDownIcon color="error" fontSize="inherit" sx={{ ml: 2, mr: 1 }} />
            审核拒绝
        </Typography>}
    </>);
}

export default SlotTable;