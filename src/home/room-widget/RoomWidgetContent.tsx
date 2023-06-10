import { Box } from '@mui/material';
import { Dayjs } from 'dayjs';
import PeriodList from './PeriodList';
import ReservationList from './ReservationList';

interface RoomWidgetContentProps {
    periods: Record<string, any>[];
    reservations: Record<string, any>[];
};

const RoomWidgetContent = (props: RoomWidgetContentProps) => {
    const { periods, reservations } = props;

    // start and end time of the periods and reservations
    let start: Dayjs|null=null, end: Dayjs|null=null;
    if (periods.length > 0 && reservations.length > 0) {
        if (periods[0].start_time.isBefore(reservations[0].start_time)) {
            start = periods[0].start_time;
        } else {
            start = reservations[0].start_time;
        }
        if (periods[periods.length - 1].end_time.isAfter(reservations[reservations.length - 1].end_time)) {
            end = periods[periods.length - 1].end_time;
        } else {
            end = reservations[reservations.length - 1].end_time;
        }
    } else if (periods.length > 0) {
        start = periods[0].start_time;
        end = periods[periods.length - 1].end_time;
    } else if (reservations.length > 0) {
        start = reservations[0].start_time;
        end = reservations[reservations.length - 1].end_time;
    } else {
        return <></>;
    }
    
    return (
        <Box position="relative" height="100%">
            {start && end && <>
                <PeriodList periods={periods} start={start} end={end} />
                <ReservationList reservations={reservations} start={start} end={end} />
            </>}
        </Box>
    );
}

export default RoomWidgetContent;