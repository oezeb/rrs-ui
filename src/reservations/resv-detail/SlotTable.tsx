import {
    Box,
    IconButton,
    Tooltip,
} from "@mui/material";
import React from "react";

import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import Typography from '@mui/material/Typography';

import { descComp, resvStatusColors } from 'utils/util';
import { paths as api_paths, resv_status } from "utils/api";
import CancelDialog from "./CancelDialog";
import Table, { TableSkeleton } from "utils/Table";


export type Action = "cancel"|"accept"|"reject";

interface SlotTableProps {
    resv: Record<string, any>|undefined;
    setResv: React.Dispatch<React.SetStateAction<Record<string, any>|undefined>>;
}

function SlotTable(props : SlotTableProps) {
    const { resv, setResv } = props;
    const [status, setStatus] = React.useState<Record<string, any>>({});
    const [slotIds, setSlotIds] = React.useState<(number|string)[]>([]);


    React.useEffect(() => {
        fetch(api_paths.resv_status)
            .then(res => res.json())
            .then(data => setStatus(data.reduce((acc: Record<string, any>, item: Record<string, any>) => {
                acc[item.status] = item;
                return acc;
            }, {})));
    }, []);

    const handleCancel = (slot_id?: number) => {
        if (slot_id !== undefined) {
            setSlotIds([slot_id]);
        } else {
            setSlotIds(resv?.time_slots.filter((slot: any) => (
                slot.status === resv_status.pending || slot.status === resv_status.confirmed
            )).map((slot: any) => slot.slot_id) || []);
        }
    };

    const onCancelDialogClose = (confirm: boolean) => {
        setSlotIds([]);
        if (confirm) {
            setResv(undefined);
        }
    };

    const actions = (<>
        {resv && resv.time_slots.length > 1 && resv.time_slots.some((slot: any) => (
            slot.status === resv_status.pending || slot.status === resv_status.confirmed
        )) &&
        <Tooltip title="全部取消">
            <IconButton size="small"  color="error" onClick={() => handleCancel()}>
                <CancelIcon fontSize="inherit"/>
            </IconButton>
        </Tooltip>}
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
                return (
                    <Box display="flex" alignItems="center">
                        <Box component="span"
                            borderBottom={3}
                            borderColor={resvStatusColors[row[field]]}
                        >
                            {status[row[field]]?.label ?? row[field]}
                        </Box>
                        {status[row[field]]?.description &&
                        <Tooltip title={status[row[field]]?.description}>
                            <HelpIcon fontSize="inherit" sx={{ ml: 1 }} />
                        </Tooltip>}
                    </Box>
                );
            case "actions":
                return (
                    <Box display="flex" alignItems="center">
                        {row.status === resv_status.pending || row.status === resv_status.confirmed ? (
                            <Tooltip title="取消">
                                <IconButton size="small" color="error" onClick={() => handleCancel(row.slot_id)}>
                                    <CancelIcon fontSize="inherit"/>
                                </IconButton>
                            </Tooltip>
                        ) : null}
                    </Box>
                );
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
        <CancelDialog
            resv_id={resv.resv_id} 
            slot_ids={slotIds} 
            onClose={onCancelDialogClose}
        />
    </>);
}

export const ActionHelper = () => (
    <Typography variant="caption" component="span" sx={{ mr: 2 }}>
        <CancelIcon color="error" fontSize="inherit" sx={{ ml: 2, mr: 1 }} />
        取消预约
    </Typography>
);

export default SlotTable;