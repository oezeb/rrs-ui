import {
    Box,
    Autocomplete,
    TextField,
    Typography
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState, useCallback } from "react";

import { usePeriods } from "providers/PeriodsProvider";
import { paths as api_paths, resv_status } from "utils/api";
import { TimeWindow, Option as _Option, optionEqual } from "reservations/add/SelectDateTime";

interface Option extends _Option {
    disabled: boolean;
}

interface SelectTimeProps {
    room_id?: string|number;
    date: Dayjs;
    timeWindow: TimeWindow;
}

function SelectTime(props: SelectTimeProps) {
    const { room_id, date, timeWindow } = props;
    const [periods, setPeriods] = useState<Record<string, any>[]>([]);
    const [reservations, setReservations] = useState<Record<string, any>[]>([]);
    const [startOption, setStartOption] = useState<Option|null>(null);
    const [endOption, setEndOption] = useState<Option|null>(null);

    const _periods = usePeriods().periods;

    useEffect(() => {
        setStartOption(null);
        setEndOption(null);
        let _date = date.format('YYYY-MM-DD');
        setPeriods(_periods.map((p) => ({
            ...p,
            start_time: dayjs(`${_date} ${p.start_time.format()}`),
            end_time: dayjs(`${_date} ${p.end_time.format()}`),
            disabled: false,
        })));
    }, [_periods, date]);

    useEffect(() => {
        if (room_id === undefined) return;
        let _date = date.format('YYYY-MM-DD');
        fetch(api_paths.admin.reservations + `?room_id=${room_id}&start_date=${_date}`)
            .then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => setReservations(data
                .filter((r: Record<string, any>) => (
                    r.status === resv_status.pending || r.status === resv_status.confirmed
                ))
                .map((resv: Record<string, any>) => {
                    return {
                        ...resv,
                        start_time: dayjs(resv.start_time),
                        end_time: dayjs(resv.end_time),
                    };
                })
            ))
            .catch((err) => console.error(err));
    }, [room_id, date]);

    const filterPeriods = useCallback(() => {
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
    }, [periods, reservations, timeWindow]);

    const startOptions = () => {
        let _periods = filterPeriods();
        let _startOptions: Option[] = _periods.map((p, i) => ({
            index: i,
            time: p.start_time,
            disabled: p.disabled,
        }));

        if (endOption !== null) {
            let i = _periods.length - 1;
            while (i > endOption.index) {
                _startOptions[i].disabled = true;
                i--;
            }

            i = endOption.index - 1;
            while (i >= 0) {
                let p = _periods[i];
                if (p.disabled || !p.end_time.isSame(_periods[i + 1].start_time)) {
                    break; // not continuous
                }

                i--;
            }

            while (i >= 0) {
                _startOptions[i].disabled = true;
                i--;
            }
        }

        return _startOptions;
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
            let i = 0;
            while(i < startOption.index) {
                _endOptions[i].disabled = true;
                i++;
            }

            i = startOption.index + 1;
            while(i < _periods.length) {
                let p = _periods[i];
                if (p.disabled || !p.start_time.isSame(_periods[i - 1].end_time)) {
                    break; // not continuous
                }

                i++;
            }

            while(i < _periods.length) {
                _endOptions[i].disabled = true;
                i++;
            }
        }

        return _endOptions;
    };

    const AutoCompleteProps = {
        fullWidth: true, size: "small" as const,
        getOptionLabel: (option: Option) => option.time.format('HH:mm'),
        isOptionEqualToValue: (v1: Option, v2: Option) => optionEqual(v1, v2),
        getOptionDisabled: (option: Option) => option.disabled,
    };

    return (
        <Box display="flex" width="100%">
            <Autocomplete {...AutoCompleteProps}
                value={startOption}
                options={startOptions()}
                onChange={(e: any, value: Option | null) => setStartOption(value)}
                disabled={room_id === undefined}
                renderInput={(params) => (
                    <TextField {...params} required variant="standard"
                        name="start_time"
                        label="开始时间"
                        helperText={room_id === undefined ? "请先选择房间" : undefined}
                    />
                )}
            />
            <Box><Typography variant="h6" sx={{ margin: 2 }}>~</Typography></Box>
            <Autocomplete {...AutoCompleteProps}
                value={endOption}
                options={endOptions()}
                onChange={(e: any, value: Option | null) => setEndOption(value)}
                disabled={room_id === undefined}
                renderInput={(params) => (
                    <TextField {...params} required variant="standard"
                        name="end_time"
                        label="结束时间"
                    />
                )}
            />
        </Box>
    );
}

export default SelectTime;