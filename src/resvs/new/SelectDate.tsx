import { useEffect, useState } from "react";
import { 
    Box, 
    Skeleton, 
    Typography 
} from "@mui/material";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import dayjs, { Dayjs } from "dayjs";
import weekday from 'dayjs/plugin/weekday';
import 'dayjs/locale/zh-cn'

import { time } from "../../util";

dayjs.extend(weekday);
dayjs.locale('zh-cn');

interface SelectDateProps {
    date: Dayjs;
    setDate: (date: Dayjs) => void;
}

function SelectDate({ date, setDate }: SelectDateProps) {
    const [dates, setDates] = useState<Dayjs[]>([]);

    useEffect(() => {
        fetch('/api/settings?id=1')
            .then((res) => res.json())
            .then((data) => {
                let time_window = time(data[0].value).diff(time('00:00'), 'day');
                setDates(Array.from({ length: time_window }, (_, i) => {
                    return dayjs().add(i, 'day');
                }));
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const handleChange = (_: React.MouseEvent<HTMLElement>, value: string) => {
        if (value) { setDate(dayjs(value)); }
    };

    const dateStr = (date: Dayjs) => date.format('YYYY-MM-DD');

    return (
        <ToggleButtonGroup fullWidth exclusive color="primary" value={dateStr(date)}
            onChange={handleChange} sx={{ margin: 'auto' }}
        >
            {dates.length? dates.map((date) => (
                <ToggleButton key={dateStr(date)} value={dateStr(date)}>
                    <Box>
                        <Typography variant='body2'>
                            {date.format('ddd')}
                        </Typography>
                        <Typography variant='caption'>
                            {dateStr(date)}
                        </Typography>
                    </Box>
                </ToggleButton>
            )) : <ToggleButtonsSkeleton />}
        </ToggleButtonGroup>
    );
}

const ToggleButtonsSkeleton = () => (
    <Skeleton width="100%" height={70} variant="rectangular" component="div" animation="wave" />
);

export default SelectDate;