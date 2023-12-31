import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import { paths as api_paths, setting } from "utils/api";
import SelectDate from "./SelectDate";
import SelectTime from "./SelectTime";
import { TimeDelta } from "utils/util";

export interface Option {
    index: number;
    time: Dayjs;
}

export interface TimeWindow {
    start: Dayjs;
    end: Dayjs;
}

export const optionEqual = (a: Option, b: Option) => {
    return a.index === b.index && a.time.isSame(b.time);
};

export interface SelectDateTimeProps {
    date: Dayjs;
    setDate: (date: Dayjs) => void;

    room_id: string|number;
}

function SelectDateTime(props: SelectDateTimeProps) {
    const { date, setDate, room_id } = props;
    const [window, setWindow] = useState<TimeWindow>({start: dayjs(), end: dayjs()});
    const [max_time, setMaxTime] = useState<number|undefined>(undefined);

    useEffect(() => {
        fetch(api_paths.settings + `?id=${setting.timeWindow}`)
            .then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => {
                let s = data[0].value.split(':');
                setWindow(old => {
                    return {
                        ...old,
                        end: old.start.add(parseInt(s[0]), 'hour').add(parseInt(s[1]), 'minute').add(parseInt(s[2]), 'second')
                    }
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    useEffect(() => {
        fetch(api_paths.settings + `?id=${setting.timeLimit}`)
        .then((res) => res.ok ? res.json() : Promise.reject(res))
        .then((data) => setMaxTime(TimeDelta.from(data[0].value).totalSeconds))
        .catch((err) => {
            console.error(err);
            setMaxTime(0);
        });
    }, []);

    return (
        <Box>
            <SelectDate date={date} setDate={setDate} timeWindow={window} />
            <Box sx={{ mt: 1 }}>
                <SelectTime 
                    room_id={room_id} date={date} 
                    timeWindow={window}
                    max_time={max_time}
                />
            </Box>
        </Box>
    )
}

export default SelectDateTime;