import { useEffect, useState } from "react";
import { 
    Autocomplete as MuiAutocomplete, 
    Box, 
    TextField, 
    Typography 
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";

import { Option as _Option, TimeWindow, optionEqual, formatDateTime } from "./SelectDateTime";
import { usePeriods } from "../../PeriodsProvider";
import { paths as api_paths, resv_status } from "../../api";

interface Option extends _Option {
    disabled: boolean;
}

interface SelectTimeProps {
    room_id: string|number;
    date: Dayjs;
    timeWindow: TimeWindow;
    max_time?: number;
}

function SelectTime(props: SelectTimeProps) {
    const { room_id, date, timeWindow, max_time } = props;
    const [periods, setPeriods] = useState<Record<string, any>[]>([]);
    const [reservations, setReservations] = useState<Record<string, any>[]>([]);
    // const [startOptions, setStartOptions] = useState<Option[]>([]);
    const [startOption, setStartOption] = useState<Option|null>(null);
    const [endOption, setEndOption] = useState<Option|null>(null);
    // const [endOptions, setEndOptions] = useState<Option[]>([]);

    const _periods = usePeriods().periods;
    
    useEffect(() => {
        setPeriods(_periods.map((p) => ({
            ...p,
            start_time: dayjs(formatDateTime(date, p.start_time)),
            end_time: dayjs(formatDateTime(date, p.end_time)),
            disabled: false,
        })));
        setStartOption(null);
        setEndOption(null);
    }, [_periods, date]);

    useEffect(() => {
        let url = api_paths.reservations + `?room_id=${room_id}&start_date=${date.format('YYYY-MM-DD')}`;
        fetch(url)
        .then((res) => res.json())
        .then((data) => {
            setReservations(data.filter((r: Record<string, any>) => (
                r.status === resv_status.pending || r.status === resv_status.confirmed
            ))
                .map((resv: Record<string, any>) => {
                    return {
                        ...resv,
                        start_time: dayjs(resv.start_time),
                        end_time: dayjs(resv.end_time),
                    };
                }));
        })
        .catch((err) => {
            console.error(err);
        });
    }, [room_id, date]);

    const filterPeriods = () => {
        let _periods = periods;
        for (let p of _periods) {
            if (p.start_time >= timeWindow.start && p.end_time <= timeWindow.end && reservations.every((r) => (
                r.start_time >= p.end_time || r.end_time <= p.start_time
            ))) {
                p.disabled = false;
            } else {
                p.disabled = true;
            }
        }
        return _periods;
    };

    const endOptions = () => {  
        let _periods = filterPeriods();  
        let _endOptions: Option[] = _periods.map((p, i) => {
            return {
            index: i,
            time: p.end_time,
            disabled: p.disabled,
        }});
        
        if (startOption !== null) {
            let continuous = true;
            let below_max_time = true;
            for (let i = 0; i < filterPeriods.length; i++) {
                let p = _periods[i];
                if (p.disabled === false) {
                    if (i < startOption.index) {
                        _endOptions[i].disabled = true;
                    } else {
                        if (continuous && i > startOption.index && !p.start_time.isSame(_periods[i - 1].end_time)) {
                            continuous = false;
                        }

                        if (below_max_time && max_time !== undefined && p.end_time.diff(startOption.time, 'second') > max_time) {
                            below_max_time = false;
                        }

                        if (!continuous || !below_max_time) {
                            _endOptions[i].disabled = true;
                        }
                    }
                }
            }
        }

        return _endOptions;
    };

    const startOptions = () => {
        let _periods = filterPeriods();
        let _startOptions: Option[] = _periods.map((p, i) => ({
            index: i,
            time: p.start_time,
            disabled: p.disabled,
        }));

        if (endOption !== null) {
            let continuous = true;
            let below_max_time = true;
            for (let i = _periods.length - 1; i >= 0; i--) {
                let p = _periods[i];
                if (!p.disabled) {
                    if (i > endOption.index) {
                        _startOptions[i].disabled = true;
                    } else {
                        if (continuous && i < endOption.index && !p.end_time.isSame(_periods[i + 1].start_time)) {
                            continuous = false;
                        }

                        if (below_max_time && max_time !== undefined && endOption.time.diff(p.start_time, 'second') > max_time) {
                            below_max_time = false;
                        }

                        if (!continuous || !below_max_time) {
                            _startOptions[i].disabled = true;
                        }
                    }
                }
            }
        }

        return _startOptions;
    };

    return (
        <Box display="flex" width="100%">
            <AutoComplete
                name="start_time"
                value={startOption}
                options={startOptions()}
                label="开始时间"
                onChange={(e: any, value: Option | null) => setStartOption(value)}
                max_time={max_time}
            />
            <Box><Typography variant="h6" sx={{ margin: 2 }}>~</Typography></Box>
            <AutoComplete
                name="end_time"
                value={endOption}
                options={endOptions()}
                label="结束时间"
                onChange={(e: any, value: Option | null) => setEndOption(value)}
            />
        </Box>
    );
}

const timeView = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0 && m > 0) {
        return `${h}小时${m}分钟`;
    } else if (h > 0) {
        return `${h}小时`;
    } else {
        return `${m}分钟`;
    }
}

interface AutoCompleteProps {
    name: string;
    value: Option | null;
    options: Option[];
    label: string;
    onChange: (event: any, value: Option | null) => void;
    max_time?: number;
}

const AutoComplete = ({ name, value, options, label, onChange, max_time }: AutoCompleteProps) => (
    <MuiAutocomplete fullWidth size="small" 
        getOptionLabel={(option) => option.time.format('HH:mm')}
        isOptionEqualToValue={(v1, v2) => optionEqual(v1, v2)}
        getOptionDisabled={(option) => option.disabled}
        
        value={value} 
        options={options}
        onChange={onChange}
        renderInput={(params) => (
            <TextField {...params} required variant="standard"
                name={name}
                label={label}
                helperText={max_time !== undefined? <>最长预约时间：{timeView(max_time)}</>: null}
            />
        )}
    />
)

export default SelectTime;