import { Box, Button, Popover } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Dayjs } from 'dayjs';

import { paths as api_paths, resv_status } from "utils/api";


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

const DetailPopover = ({ resv }: { resv: Record<string, any> }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [user, setUser] = useState<Record<string, any> | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        fetch(api_paths.users + `?username=${resv.username}`)
            .then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => setUser(data[0]))
            .catch((err) => console.error(err));
    }, [resv.username]);

    const open = Boolean(anchorEl);
    return (
        <Box key={resv.resv_id} 
            height="100%" width="100%"
            display="flex" overflow="hidden" whiteSpace="nowrap"
        >
            <Button fullWidth variant='text'  onClick={handleClick}
                sx={{
                    color: 'text.secondary',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                }}
            >
                {resv.status === resv_status.pending ? "待审核" : resv.title}
            </Button>
            <Popover open={open} anchorEl={anchorEl} onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box borderBottom="5px solid darkgreen" p="0 1em 0 1em" bgcolor="lightgreen">
                    <Typography variant="h6" component="div" color="darkgreen">
                        {resv.title}
                    </Typography>
                    <Typography variant="body2">
                        {user ? user.name : null}
                    </Typography>
                    <Typography variant="body2">
                        {resv.start_time.format('HH:mm')} - {resv.end_time.format('HH:mm')}
                    </Typography>
                </Box>
            </Popover>
        </Box>
    );
};

export default ReservationList;