import { Box, Button, Popover } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { paths as api_paths, resv_status } from "utils/api";

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
        let url = api_paths.users + `?username=${resv.username}`;
        fetch(url).then((res) => res.json()).then((data) => {
            setUser(data[0]);
        }).catch((err) => {
            console.error(err);
        });
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

export default DetailPopover;