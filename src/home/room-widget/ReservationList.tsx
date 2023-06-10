import { Box } from '@mui/material';
import { Dayjs } from 'dayjs';
import { resv_status } from 'utils/api';
import DetailPopover from './DetailPopover';

interface ReservationListProps {
    reservations: Record<string, any>[];
    start: Dayjs;
    end: Dayjs;
}

const ReservationList = ({ reservations, start, end }: ReservationListProps) => {
    const totalDuration = end?.diff(start, 'second') || 0;
    const height = (start: Dayjs, end: Dayjs) => 100 * end.diff(start, 'second') / totalDuration;

    let pos = 0;
    const resv_views: JSX.Element[] = [];
    for (let i = 0; i < reservations.length; i++) {
        const resv = reservations[i];
        if (i === 0 && start?.isBefore(resv.start_time)) {
            pos += height(start, resv.start_time);
        }
        if (i > 0 && reservations[i - 1].end_time.isBefore(resv.start_time)) {
            pos += height(reservations[i - 1].end_time, resv.start_time);
        }
        resv_views.push(
            <Box key={resv.resv_id} position="absolute" top={`${pos}%`}
                height={`${height(resv.start_time, resv.end_time)}%`}
                width="100%"
                bgcolor={resv.status === resv_status.pending ? '#FFCF39' : 'lightgreen'}
            ><DetailPopover resv={resv} /></Box>
        );
        pos += height(resv.start_time, resv.end_time);
    }

    return (
        <>{resv_views}</>
    );
};

export default ReservationList;