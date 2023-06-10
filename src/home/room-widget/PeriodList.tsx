import { Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { Dayjs } from 'dayjs';

interface PeriodListProps {
    periods: Record<string, any>[];
    start: Dayjs;
    end: Dayjs;
}

const PeriodList = ({ periods, start, end }: PeriodListProps) => {
    const totalDuration = end?.diff(start, 'second') || 0;
    const height = (start: Dayjs, end: Dayjs) => 100 * end.diff(start, 'second') / totalDuration;

    const period_view = (key: any, start: Dayjs, end: Dayjs, is_break: boolean) => {
        const format = (time: Dayjs) => time.format('HH:mm');
        let view = <Box
            key={key}
            height={`${height(start, end)}%`}
            borderTop="1px dotted rgba(0,0,0,.1)"
            bgcolor={is_break ? '#C0C0C0' : undefined}
        />
        if (is_break) {
            return view;
        } else {
            return (
                <Tooltip key={key} placement='top'
                    title={`${format(start)} - ${format(end)}`} >
                    {view}
                </Tooltip>
            );
        }
    };

    const period_views: JSX.Element[] = [];
    for (let i = 0; i < periods.length; i++) {
        const period = periods[i];
        if (i === 0 && start?.isBefore(period.start_time)) {
            period_views.push(period_view(`break-${i}`, start, period.start_time, true));
        }
        if (i > 0 && periods[i - 1].end_time.isBefore(period.start_time)) {
            period_views.push(period_view(`break-${i}`, periods[i - 1].end_time, period.start_time, true));
        }
        period_views.push(period_view(period.period_id, period.start_time, period.end_time, false));
        if (i === periods.length - 1 && end?.isAfter(period.end_time)) {
            period_views.push(period_view(`break-${i + 1}`, period.end_time, end, true));
        }
    }

    return (
        <>{period_views}</>
    );
};

export default PeriodList;