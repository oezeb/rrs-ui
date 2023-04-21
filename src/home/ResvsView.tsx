import {  Box } from '@mui/material';
import { Dayjs } from 'dayjs';
import Tooltip from '@mui/material/Tooltip';
import ResvPopover from './ResvPopover';
import { ResvStatus } from '../util';

interface ResvsViewProps {
    periods: Record<string, any>[];
    reservations: Record<string, any>[];
};

function ResvsView(props: ResvsViewProps) {
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
                <Periods periods={periods} start={start} end={end} />
                <Resvs reservations={reservations} start={start} end={end} />
            </>}
        </Box>
    );
}

interface PeriodsProps {
    periods: Record<string, any>[];
    start: Dayjs;
    end: Dayjs;
}

const Periods = ({ periods, start, end }: PeriodsProps) => {
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
                <Tooltip key={key} 
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

interface ResvsProps {
    reservations: Record<string, any>[];
    start: Dayjs;
    end: Dayjs;
}

const Resvs = ({ reservations, start, end }: ResvsProps) => {
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
                bgcolor={resv.status === ResvStatus.pending ? '#FFCF39' : 'lightgreen'}
            ><ResvPopover resv={resv} /></Box>
        );
        pos += height(resv.start_time, resv.end_time);
    }

    return (
        <>{resv_views}</>
    );
};

export default ResvsView;