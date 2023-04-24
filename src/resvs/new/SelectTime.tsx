import { useEffect, useState, useMemo } from "react";
import { 
    Autocomplete, 
    Box, 
    TextField, 
    Typography 
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";

import { ResvStatus, Setting, time } from "../../util";
import { Option, optionEqual } from "./SelectDateTime";
import { usePeriods } from "../../PeriodsProvider";

interface SelectTimeProps {
    room_id: string;
    date: Dayjs;
    start: Dayjs;
    end: Dayjs;
    startOption: Option|null;
    setStartOption: (option: Option|null) => void;
    endOption: Option|null;
    setEndOption: (option: Option|null) => void;
}

function SelectTime(props: SelectTimeProps) {
    const { room_id, date, start, end, startOption, setStartOption, endOption, setEndOption } = props;
    const [reservations, setReservations] = useState<Record<string, any>[]>([]);
    const [max_time, setMaxTime] = useState(0); // seconds
    const [startOptions, setStartOptions] = useState<Option[]>([]);
    const [endOptions, setEndOptions] = useState<Option[]>([]);

    const { periods } = usePeriods();

    const options = (periods: Record<string, any>[], t: "start" | "end") => {
        return periods.map((period, i) => {
            return {index: i,
                time: t === "start" ? period.start_time : period.end_time,
            };
        });
    };

    const filterPeriods = useMemo(() => {
        const t = (p: any) => dayjs(`${date.format('YYYY-MM-DD')} ${p.format('HH:mm:ss')}`);
        return periods.map((p: any) => ({
            ...p,
            start_time: t(p.start_time),
            end_time: t(p.end_time),
        })).filter((p: Record<string, any>) => (
            // filter out periods that are not in the time window
            // or are already reserved
            p.start_time >= start && p.end_time <= end && reservations.every((r) => (
                (r.start_time >= p.end_time || r.end_time <= p.start_time)
            ))
        ));
    }, [date, start, end, periods, reservations]);

    useEffect(() => {
            setStartOptions(options(filterPeriods, "start"));
            setEndOptions(options(filterPeriods, "end"));
            setStartOption(null);
            setEndOption(null);
    }, [filterPeriods, setStartOptions, setEndOptions, setStartOption, setEndOption]);

    useEffect(() => {
        let url = `/api/reservations?room_id=${room_id}&date=${date.format('YYYY-MM-DD')}`;
        fetch(url)
        .then((res) => res.json())
        .then((data) => {
            setReservations(data.filter((r: Record<string, any>) => (
                r.status === ResvStatus.pending || r.status === ResvStatus.confirmed
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

    useEffect(() => {
        fetch(`/api/settings?id=${Setting.timeLimit}`)
        .then((res) => res.json())
        .then((data) => {
            setMaxTime(time(data[0].value).diff(time('00:00'), 'second'))
        })
        .catch((err) => {
            console.error(err);
        });
    }, []);

    const handleStartChange = (_: any, value: Option | null) => {
        setStartOption(value);
        let endOptions = [];
        if (value) {
            for (let i = value.index; i < filterPeriods.length; i++) {
                const period = filterPeriods[i];
                // ensure continuous time
                if (i > value.index && !period.start_time.isSame(filterPeriods[i - 1].end_time)) {
                    break;
                }
                if (period.end_time.diff(value.time, 'second') <= max_time) {
                    endOptions.push({ index: i, time: period.end_time });
                } else { break; }
            }
        } else {
            endOptions = options(filterPeriods, "end");
        }
        setEndOptions(endOptions);
    }

    const handleEndChange = (_: any, value: Option | null) => {
        setEndOption(value);
        let startOptions = [];
        if (value) {
            for (let i = value.index; i >= 0; i--) {
                let period = filterPeriods[i];
                // ensure continuous time
                if (i < value.index && !period.end_time.isSame(filterPeriods[i + 1].start_time)) {
                    break;
                }
                if (value.time.diff(period.start_time, 'second') <= max_time) {
                    startOptions.push({ index: i, time: period.start_time });
                } else { break; }
            }
            startOptions.reverse();
        } else {
            startOptions = options(filterPeriods, "start");
        }
        setStartOptions(startOptions);
    }

    const timeView = (time: number) => { // seconds
        const h = Math.floor(time / 3600);
        const m = Math.floor((time % 3600) / 60);
        if (h > 0 && m > 0) {
            return `${h}小时${m}分钟`;
        } else if (h > 0) {
            return `${h}小时`;
        } else {
            return `${m}分钟`;
        }
    }
    
    // TODO: use Autocomplete filterOptions
    const auto_complete_view = (value: Option | null, options: Option[], label: string,
        onChange: (event: any, value: Option | null) => void, show_max_time?: boolean) => (
        <Autocomplete fullWidth value={value} options={options}
            getOptionLabel={(option) => option.time.format('HH:mm')}
            isOptionEqualToValue={(option, value) => optionEqual(option, value)}
            renderInput={(params) => <TextField {...params} label={label} variant="standard"
                helperText={show_max_time? <>最长预约时间：{timeView(max_time)}</>: null}
            />}
            onChange={onChange}
        />
    );

    return (
        <Box display="flex" width="100%">
            {auto_complete_view(startOption, startOptions, "开始时间", handleStartChange, true)}
            <Box><Typography variant="h6" sx={{ margin: 2 }}>~</Typography></Box>
            {auto_complete_view(endOption, endOptions, "结束时间", handleEndChange)}
        </Box>
    );
}


export default SelectTime;