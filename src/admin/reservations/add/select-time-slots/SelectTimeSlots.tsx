import {
    Box,
    IconButton,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useSnackbar } from 'providers/SnackbarProvider';
import React from "react";
import DeleteIcon from '@mui/icons-material/Delete';

import { resv_status } from "utils/api";
import SlotTable from './SlotTable';
import AddTimeSlotWidget from './add-time-slot/AddTimeSlot';
import RepeatWidget, { RepeatType, genSlots, hasConflict } from './RepeatWidget';

interface SelectTimeSlotsProps {
    date: Dayjs;
    setDate: (date: Dayjs) => void;

    room_id?: string|number;
    session?: Record<string, any>;

    setSlots: (slots: Record<string, any>[]) => void;
}

const SelectTimeSlots = (props: SelectTimeSlotsProps) => {
    const { date, setDate, room_id, session } = props;
    const setValidSlots = props.setSlots;

    const [slots, setSlots] = React.useState<Record<string, any>[]>([]);
    const [repeatType, setRepeatType] = React.useState<RepeatType>("none");
    const [conflicts, setConflicts] = React.useState<Record<string, any>[]|undefined>(undefined);

    const { showSnackbar } = useSnackbar();

    const onAddSlot = (slot: Record<string, any>) => {
        let start_time = slot.start_time;
        let end_time = slot.end_time;

        let conflict: number = -1;
        for (let i = 0; i < slots.length; i++) {
            let slot = slots[i];
            if (slot.end_time.isBefore(start_time) || slot.start_time.isAfter(end_time)
                || slot.end_time.isSame(start_time) || slot.start_time.isSame(end_time)) {
                continue;
            } else {
                conflict = i;
                break;
            }
        }

        if (conflict !== -1) {
            showSnackbar({
                message: `时间段与已选时间段${conflict + 1}重叠`,
                severity: 'error',
            });
        } else {
            let _slots = [...slots, {
                start_time: dayjs(start_time),
                end_time: dayjs(end_time),
                status: slot.status??resv_status.confirmed,
            }];
            setSlots(_slots);
            
            if (repeatType === "none") {
                setValidSlots(_slots);
            } else {
                setValidSlots([]);
            }

            showSnackbar({
                message: '添加成功',
                severity: 'success',
                duration: 2000,
            });
        }
    };

    const onRemoveSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index));
    };

    const onValidateRepeat = (until: Dayjs) => {
        if (room_id === undefined) return;

        setConflicts(undefined);
        let promises: Promise<any>[] = [];
        for (let slot of genSlots(slots, repeatType, until)) {
            let _has_conflict = async () => {
                let res = await hasConflict(slot, room_id);
                return { slot, has_conflict: res };
            };

            promises.push(_has_conflict());
        }

        let conflicts: Record<string, any>[] = [];
        let valid_slots: Record<string, any>[] = [];
        Promise.all(promises).then((results) => {
            for (let result of results) {
                if (result.has_conflict) {
                    conflicts.push(result.slot);
                } else {
                    valid_slots.push(result.slot);
                }
            }

            setConflicts(conflicts);
            setValidSlots(valid_slots);
            if (conflicts.length > 0) {
                showSnackbar({
                    message: "一些时间段有重叠。如果继续，这些时间段将被忽略。",
                    severity: "error",
                });
            } else {
                showSnackbar({
                    message: "没有重叠",
                    severity: "success",
                    duration: 2000,
                });
            }
        });
    };

    return (
        <Box>
            <AddTimeSlotWidget
                date={date}
                setDate={setDate}
                room_id={room_id}
                session={session}
                onAdd={onAddSlot}
            />
            <SlotTable
                title='已选时段' 
                slots={slots} 
                action={(_, i) => (
                    <IconButton size="small" onClick={() => onRemoveSlot(i)}>
                        <DeleteIcon fontSize="inherit"/>
                    </IconButton>
                )}
            />
            <RepeatWidget
                type={repeatType}
                setType={(type) => {
                    setRepeatType(type);
                    if (type === "none") {
                        setValidSlots(slots);
                    } else {
                        setValidSlots([]);
                    }
                    setConflicts(undefined);
                }}
                has_conflict={conflicts === undefined ? undefined : conflicts.length > 0}
                onValidate={onValidateRepeat}
                session={session}
            />
            {conflicts && conflicts.length > 0 && <SlotTable title='重叠时段' slots={conflicts} />}
        </Box>
    );
}

export default SelectTimeSlots;