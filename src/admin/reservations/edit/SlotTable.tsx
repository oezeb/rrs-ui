import {
    Box,
    IconButton, 
    Skeleton,
    Tooltip,
} from "@mui/material";
import React from "react";

import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Typography from '@mui/material/Typography';

import { descComp, resvStatusColors } from 'utils/util';
import { resv_status } from "utils/api";
import ActionDialog from "./ActionDialog";
import { paths as api_paths } from "utils/api";
import Table, { TableSkeleton } from "utils/Table";

export type Action = "cancel"|"accept"|"reject";

interface SlotTableProps {
    resv: Record<string, any>|undefined;
    setResv: React.Dispatch<React.SetStateAction<Record<string, any>|undefined>>;

    allowedActions?: Action[];
}

function SlotTable(props : SlotTableProps) {
    const { resv, setResv } = props;
    const [status, setStatus] = React.useState<Record<string, any>>({});
    const [slotIds, setSlotIds] = React.useState<(number|string)[]>([]);
    const [action, setAction] = React.useState<Action|undefined>(undefined);

    const allowedActions = new Set<Action>(props.allowedActions??["cancel", "accept", "reject"]);

    React.useEffect(() => {
        fetch(api_paths.admin.resv_status)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setStatus(data
                .reduce((acc: Record<string, any>, item: Record<string, any>) => {
                    acc[item.status] = item;
                    return acc;
                }, {})
            ))
            .catch(err => console.log(err));
    }, []);

    const handleCancel = (slot_id?: number) => {
        if (allowedActions.has("cancel")) {
            if (slot_id !== undefined) {
                setSlotIds([slot_id]);
            } else {
                setSlotIds(resv?.time_slots.filter((slot: any) => (
                    slot.status === resv_status.pending || slot.status === resv_status.confirmed
                )).map((slot: any) => slot.slot_id) ?? []);
            }
            setAction("cancel");
        }
    };

    const handleConfirm = (slot_id?: number) => {
        if (allowedActions.has("accept")) {
            if (slot_id !== undefined) {
                setSlotIds([slot_id]);
            } else {
                setSlotIds(resv?.time_slots.filter((slot: any) => (
                    slot.status === resv_status.pending
                )).map((slot: any) => slot.slot_id) ?? []);
            }
            setAction("accept");
        }
    };

    const handleReject = (slot_id?: number) => {
        if (allowedActions.has("reject")) {
            if (slot_id !== undefined) {
                setSlotIds([slot_id]);
            } else {
                setSlotIds(resv?.time_slots.filter((slot: any) => (
                    slot.status === resv_status.pending
                )).map((slot: any) => slot.slot_id) ?? []);
            }
            setAction("reject");
        }
    };

    const onActionDialogClose = (confirm: boolean) => {
        setAction(undefined);
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

    const comparator = (
        a: Record<string, any>,
        b: Record<string, any>,
        orderBy: string,
    ) => {
        if (orderBy === "start_time" || orderBy === "end_time") {
            if (b[orderBy].isBefore(a[orderBy])) {
                return -1;
            } else if (b[orderBy].isAfter(a[orderBy])) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return descComp(a, b, orderBy);
        }
    };

    const columns = [
        { field: "slot_id", label: "编号" },
        { field: "start_time", label: "开始时间" },
        { field: "end_time", label: "结束时间" },
        { field: "status", label: "状态" },
        { field: "actions", label: <>操作{actions}</>, noSort: true },
    ];

    const renderValue = (row: Record<string, any>, field: string) => {
        switch (field) {
            case "start_time":
            case "end_time":
                return row[field].format("YYYY-MM-DD HH:mm");
            case "status":
                return row.status !== undefined ? (
                    <Box display="flex" alignItems="center">
                        <Box component="span"
                            borderBottom={3}
                            borderColor={resvStatusColors[row.status]}
                        >
                            {status[row.status]?.label ?? row.status}
                        </Box>
                        {status[row.status]?.description &&
                        <Tooltip title={status[row.status]?.description}>
                            <HelpIcon fontSize="inherit" sx={{ ml: 1 }} />
                        </Tooltip>}
                    </Box>
                ) : <Skeleton />;
            case "actions":
                return (<>
                    {allowedActions.has("cancel") &&
                        (row.status === resv_status.pending || row.status === resv_status.confirmed) ? (
                            <IconButton color="error" size="small" onClick={() => handleCancel(row.slot_id)}>
                                <CancelIcon fontSize="inherit" />
                            </IconButton>
                        ) : null}
                        {row.status === resv_status.pending ? (<>
                            {allowedActions.has("accept") &&
                            <IconButton color="success" size="small" onClick={() => handleConfirm(row.slot_id)}>
                                <ThumbUpIcon fontSize="inherit" />
                            </IconButton>}
                            {allowedActions.has("reject") &&
                            <IconButton color="error" size="small" onClick={() => handleReject(row.slot_id)}>
                                <ThumbDownIcon fontSize="inherit" />
                            </IconButton>}
                        </>) : null}
                </>);
            default:
                return row[field];
        }
    };

    if (resv === undefined) {
        return (
            <TableSkeleton 
                rowCount={5}
                columns={columns.map((column) => column.label)}
            />
        );
    }

    return (<>
        <Table
            columns={columns}
            rows={resv.time_slots}
            compare={comparator}
            maxHeight='35vh'
            getValueLabel={renderValue}
        />
        <ActionDialog 
            resv_id={resv.resv_id} 
            username={resv.username}
            slot_ids={slotIds}
            action={action} 
            onClose={onActionDialogClose}
        />
    </>);
}

export const ActionHelper = () => (<>
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
</>);

export default SlotTable;