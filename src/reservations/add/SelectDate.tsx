import {
    Box,
    Skeleton,
    Typography
} from "@mui/material";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import dayjs, { Dayjs } from "dayjs";

import 'dayjs/locale/zh-cn';
import { TimeWindow } from "./SelectDateTime";
dayjs.locale('zh-cn');

interface SelectDateProps {
    date: Dayjs;
    setDate: (date: Dayjs) => void;
    timeWindow: TimeWindow;
}

function SelectDate({ date, setDate, timeWindow }: SelectDateProps) {

    const handleChange = (_: React.MouseEvent<HTMLElement>, value: string) => {
        if (value) { setDate(dayjs(value)); }
    };

    const dateStr = (date: Dayjs) => date.format('YYYY-MM-DD');

    let buttons: JSX.Element[] = [];
    for (let i = timeWindow.start; i <= timeWindow.end; i = i.add(1, 'day')) {
        buttons.push(
            <ToggleButton key={dateStr(i)} value={dateStr(i)}>
                <Box>
                    <Typography variant='body2'>
                        {i.format('ddd')}
                    </Typography>
                    <Typography variant='caption'>
                        {dateStr(i)}
                    </Typography>
                </Box>
            </ToggleButton>
        );
    }


    return (
        <ToggleButtonGroup fullWidth exclusive color="primary" value={dateStr(date)}
            onChange={handleChange} sx={{ margin: 'auto' }}
        >
            {buttons.length? buttons : <ToggleButtonsSkeleton />}
        </ToggleButtonGroup>
    );
}

const ToggleButtonsSkeleton = () => (
    <Skeleton width="100%" height={70} variant="rectangular" component="div" animation="wave" />
);

export default SelectDate;