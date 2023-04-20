import { useEffect, useState } from "react";
import { 
    Autocomplete, 
    Box, 
    TextField, 
    Typography 
} from "@mui/material";
import { Dayjs } from "dayjs";

import { time } from "../../util";

export interface Option {
    index: number;
    time: Dayjs;
}

const optionEqual = (a: Option, b: Option) => {
    return a.index === b.index && a.time.isSame(b.time);
};

interface BookTimeProps {
    room_id: string;
    date: Dayjs;
    periods: Record<string, any>[];
    start: Option | null;
    setStart: (start: Option | null) => void;
    end: Option | null;
    setEnd: (end: Option | null) => void;
}

function SelectTime(props: BookTimeProps) {
    const { room_id, date, periods, start, setStart, end, setEnd } = props;
    const [max_time, setMaxTime] = useState(0); // seconds
    const [reservations, setReservations] = useState<Record<string, any>[]>([]);
    const [filteredPeriods, setFilteredPeriods] = useState<Record<string, any>[]>([]);
    const [start_options, setStartOptions] = useState<Option[]>([]);
    const [end_options, setEndOptions] = useState<Option[]>([]);

    const options = (periods: Record<string, any>[], t: "start" | "end") => {
        return periods.map((period, i) => {
            return {index: i,
                time: t === "start" ? period.start_time : period.end_time,
            };
        });
    };

    useEffect(() => {
        let start_options = options(filteredPeriods, "start");
        let end_options = options(filteredPeriods, "end");
        setEndOptions(end_options);
        setStartOptions(start_options);
        setStart(null);
        setEnd(null);
    }, [filteredPeriods, setStart, setEnd]);

    useEffect(() => {
        let url = `/api/reservations?room_id=${room_id}&date=${date.format('YYYY-MM-DD')}`;
        fetch(url).then((res) => res.json())    
            .then((data) => {
                setReservations(data.map((resv: Record<string, any>) => {
                    return {
                        ...resv,
                        start_time: time(resv.start_time),
                        end_time: time(resv.end_time),
                    };
                }));
            })
            .catch((err) => {
                console.error(err);
            });
    }, [room_id, date]);

    const isBeetwen = (t: Dayjs, t1: Dayjs, t2: Dayjs) => {
        return t.isAfter(t1) && t.isBefore(t2);
    };

    useEffect(() => {
        const filteredPeriods = periods.filter((period) => {
            return !reservations.some((resv) => {
                return (period.start_time.isSame(resv.start_time) && period.end_time.isSame(resv.end_time)) ||
                    isBeetwen(period.start_time, resv.start_time, resv.end_time) ||
                    isBeetwen(period.end_time, resv.start_time, resv.end_time);
            });
        });
        setFilteredPeriods(filteredPeriods);
    }, [periods, reservations]);

    useEffect(() => {
        fetch('/api/settings?id=2')
        .then((res) => res.json())
        .then((data) => {
            setMaxTime(time(data[0].value).diff(time('00:00'), 'second'))
        })
        .catch((err) => {
            console.error(err);
        });
    }, []);

    const handleStartChange = (_: any, value: Option | null) => {
        setStart(value);
        let end_options = [];
        if (value) {
            for (let i = value.index; i < filteredPeriods.length; i++) {
                const period = filteredPeriods[i];
                // ensure continuous time
                if (i > value.index && !period.start_time.isSame(filteredPeriods[i - 1].end_time)) {
                    break;
                }
                if (period.end_time.diff(value.time, 'second') <= max_time) {
                    end_options.push({ index: i, time: period.end_time });
                } else { break; }
            }
        } else {
            end_options = options(filteredPeriods, "end");
        }
        setEndOptions(end_options);
    }

    const handleEndChange = (_: any, value: Option | null) => {
        setEnd(value);
        let start_options = [];
        if (value) {
            for (let i = value.index; i >= 0; i--) {
                const period = filteredPeriods[i];
                // ensure continuous time
                if (i < value.index && !period.end_time.isSame(filteredPeriods[i + 1].start_time)) {
                    break;
                }
                if (value.time.diff(period.start_time, 'second') <= max_time) {
                    start_options.push({ index: i, time: period.start_time });
                } else { break; }
            }
            start_options.reverse();
        } else {
            start_options = options(filteredPeriods, "start");
        }
        setStartOptions(start_options);
    }

    const auto_complete_view = (value: Option | null, options: Option[], label: string,
        onChange: (event: any, value: Option | null) => void) => (
        <Autocomplete fullWidth value={value} options={options}
            getOptionLabel={(option) => option.time.format('HH:mm')}
            isOptionEqualToValue={(option, value) => optionEqual(option, value)}
            renderInput={(params) => <TextField {...params} label={label} variant="standard" />}
            onChange={onChange}
        />
    );

    return (
        <Box display="flex" width="100%">
            {auto_complete_view(start, start_options, "开始时间", handleStartChange)}
            <Box><Typography variant="h6" sx={{ margin: 2 }}>~</Typography></Box>
            {auto_complete_view(end, end_options, "结束时间", handleEndChange)}
        </Box>
    );
}

export default SelectTime;