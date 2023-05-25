import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

import SelectDate from "./SelectDate";
import SelectTime from "./SelectTime";
import { paths as api_paths, setting } from "../../api";
import { time } from "../../util";

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
            .then((res) => res.json())
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
        .then((res) => res.json())
        .then((data) => {
            setMaxTime(time(data[0].value).diff(time('00:00'), 'second'))
        })
        .catch((err) => {
            console.error(err);
        });
    }, []);

    return (<>
        <SelectDate date={date} setDate={setDate} timeWindow={window} />
        <SelectTime 
            room_id={room_id} date={date} 
            timeWindow={window}
            max_time={max_time}
        /></>
    )
}

export const formatDateTime = (date: dayjs.Dayjs, time: dayjs.Dayjs) => {
    return `${date.format('YYYY-MM-DD')} ${time.format('HH:mm')}`;
}

export default SelectDateTime;