import { 
    Box, 
    TextField,
    IconButton,
    Tooltip,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent,
    FormHelperText,
} from "@mui/material";
import DoneIcon from '@mui/icons-material/Done';
import dayjs, { Dayjs } from "dayjs";

import { paths as api_paths, resv_status } from "../../api";
import { useSnackbar } from "../../SnackbarProvider";
import SlotTable from "./SlotTable";

export type RepeatType = "none"|"weekly";

interface RepeatProps {
    type: RepeatType;
    setType: (value: RepeatType) => void;
    session: Record<string, any>;

    room_id: string|number;
    slots: Record<string, any>[];
    conflicts: Record<string, any>[]|undefined;
    setConflicts: (value: Record<string, any>[]|undefined) => void;
    setValidSlots: (value: Record<string, any>[]) => void;
}

const Repeat = (props: RepeatProps) => {
    const { type, setType, session, room_id, slots, conflicts, setConflicts, setValidSlots } = props;
    const {showSnackbar} = useSnackbar();
    
    const handleChange = (event: SelectChangeEvent) => {
        setType(event.target.value as RepeatType);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        let until = dayjs(`${data.get('repeat_until')}`);

        setConflicts(undefined);
        let promises: Promise<any>[] = [];
        for (let slot of genSlots(slots, type, until)) {
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
    }

    return (
        <Box>
            <Box component="form" onSubmit={handleSubmit}  sx={{ display: 'flex', justifyContent: 'center', width: "100%", mt: 2 }}>
                <FormControl variant="standard" size="small">
                    <Select autoWidth size="small" 
                        value={type}
                        onChange={handleChange}
                    >
                        <MenuItem value="none">不重复</MenuItem>
                        <MenuItem value="weekly">每周</MenuItem>
                    </Select>
                    <FormHelperText>重复预约选项</FormHelperText>
                </FormControl>
                <Box sx={{ ml: 2 }}>
                    <TextField  variant="standard" size="small"
                        name="repeat_until"
                        type="datetime-local"
                        disabled={type === "none"}
                        required={type !== "none"}
                        inputProps={{
                            min: session.start_time.format('YYYY-MM-DDTHH:mm'),
                            max: session.end_time.format('YYYY-MM-DDTHH:mm'),
                        }}
                        helperText="重复预约截止时间"
                    />
                </Box>
                <Box sx={{ ml: 2 }}>
                    <Tooltip title='验证' placement="top">
                        <IconButton size="small" disabled={type === "none"} type="submit">
                            <DoneIcon fontSize="small" color={conflicts === undefined ? undefined : conflicts.length > 0 ? "error" : "success"}/>
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            {conflicts !== undefined && conflicts.length > 0 ? (
                <SlotTable
                    title="有重叠时间段"
                    slots={conflicts.map((slot, i) => ({...slot, slot_id: i}))}
                />
            ) : null}
        </Box>
    );
}


const hasConflict = async (slot: Record<string, any>, room_id: string|number) => {
    for(let date = slot.start_time; date < slot.end_time; date = date.add(1, 'day')) {
        let url = api_paths.reservations + `?room_id=${room_id}&start_date=${date.format('YYYY-MM-DD')}`;
        try {
            let res = await fetch(url);
            let data = await res.json();
            console.log(date.format('YYYY-MM-DD'), data);
            let no_conflict = data.every((r: Record<string, any>) => (
                r.status === resv_status.cancelled || resv_status.rejected ||
                r.start_time >= slot.end_time || r.end_time <= slot.start_time
            ));

            if (!no_conflict) {
                return true;
            }
        } catch (err) {
            console.error(err);
        }
    }
    return false;
}

const genSlots = (slots: Record<string, any>[], repeatType: RepeatType, until: Dayjs) => {
    let new_slots: Record<string, any>[] = [...slots]
    if (repeatType === "weekly") {
        for (let slot of slots) {
            let start = slot.start_time;
            let end = slot.end_time;
            while (start.isBefore(until)) {
                start = start.add(1, 'week');
                end = end.add(1, 'week');
                new_slots.push({
                    start_time: start,
                    end_time: end,
                });
            }
        }
    }
    return new_slots;
}

export default Repeat;