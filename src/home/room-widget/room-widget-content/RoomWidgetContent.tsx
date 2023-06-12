import React from 'react';
import { Box, Skeleton } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import PeriodList from './PeriodList';
import ReservationList from './ReservationList';
import { usePeriods } from 'providers/PeriodsProvider';

interface RoomWidgetContentProps {
    // periods: Record<string, any>[];
    date: Dayjs;
    reservations?: Record<string, any>[];
};

const RoomWidgetContent = (props: RoomWidgetContentProps) => {
    const { date, reservations } = props;
    const [periods, setPeriods] = React.useState<Record<string, any>[]|undefined>(undefined);

    const _periods = usePeriods().periods;

    React.useEffect(() => {
        let _date = date.format('YYYY-MM-DD');
        setPeriods(undefined);
        setPeriods(_periods.map((p: Record<string, any>) => ({
            ...p,
            start_time: dayjs(`${_date} ${p.start_time.format()}`),
            end_time: dayjs(`${_date} ${p.end_time.format()}`),
        })));
    }, [date, _periods]);

    if (periods === undefined || reservations === undefined) return (
        <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            animation="wave"
        />
    );

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
        return <>无</>;
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