import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/zh-cn'

import SelectDate from "./SelectDate";
import SelectTime from "./SelectTime";
import { Setting } from "../../util";

dayjs.locale('zh-cn');

export interface Option {
    index: number;
    time: Dayjs;
}

export const optionEqual = (a: Option, b: Option) => {
    return a.index === b.index && a.time.isSame(b.time);
};

interface SelectDateTimeProps {
    date: Dayjs;
    setDate: (date: Dayjs) => void;

    room_id: string;
    startOption: Option|null;
    setStartOption: (option: Option|null) => void;
    endOption: Option|null;
    setEndOption: (option: Option|null) => void;
}

function SelectDateTime(props: SelectDateTimeProps) {
    const { date, setDate, room_id, startOption, setStartOption, endOption, setEndOption } = props;
    const [start, setStart] = useState<Dayjs>(dayjs());
    const [end, setEnd] = useState<Dayjs>(dayjs());

    useEffect(() => {
        fetch(`/api/settings?id=${Setting.timeWindow}`)
            .then((res) => res.json())
            .then((data) => {
                // data[x].value is time_window with format 'HH:mm:SS'
                // end = start + time_window
                let s = data[0].value.split(':');
                setEnd(start.add(parseInt(s[0]), 'hour').add(parseInt(s[1]), 'minute').add(parseInt(s[2]), 'second'));
            })
            .catch((err) => {
                console.error(err);
            });
    }, [start]);

    return (<>
        <SelectDate date={date} setDate={setDate} start={start} end={end} />
        <SelectTime room_id={room_id} date={date} start={start} end={end}
            startOption={startOption} setStartOption={setStartOption}
            endOption={endOption} setEndOption={setEndOption}
        /></>
    )
}

export default SelectDateTime;