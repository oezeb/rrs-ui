import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
    Box,
    IconButton,
    Skeleton,
    Table, TableBody, TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React from "react";
import log from 'loglevel';

import { TimeView } from "reservations/Reservations";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { TimeFilter, resvStatusColors as statusColors } from 'utils/util';
import FilterView from "./FilterView";

function ResvList() {
    log.info("ResvList.tsx: ResvList()");
    const [reservations, setReservations] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [resvStatus, setResvStatus] = React.useState<Record<string, any>>({});
    const [rooms, setRooms] = React.useState<Record<string, any>>({});

    const [timeFilter, setTimeFilter] = React.useState<TimeFilter>("当前");
    
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    React.useEffect(() => {
        let promises = []
        const _fetch = async (
            url: string,
            setter: React.Dispatch<React.SetStateAction<Record<string, any>>>,
            key: string,
        ) => {
            let res = await fetch(url);
            let data = await res.json();
            setter(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                acc[cur[key]] = cur;
                return acc;
            }, {}));
        };
        promises.push(_fetch(api_paths.resv_status, setResvStatus, 'status'));
        promises.push(_fetch(api_paths.rooms, setRooms, 'room_id'));
        Promise.all(promises);
    }, []);

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                预约记录
            </Typography>
            <FilterView
                url={api_paths.user_resv}
                reservations={reservations}
                setReservations={setReservations}

                filters={["time", "status"]}

                time={timeFilter}
                setTime={setTimeFilter}

                resvStatus={resvStatus}
            />
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        {["标题", "房间", "时间", "状态", "详情"]
                            .map((text) => <TableCell key={text}>{text}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {reservations && reservations.map((resv, i) => (
                        <TableRow key={i}>
                            <TableCell>{resv.title}</TableCell>
                            <TableCell>{rooms[resv.resv_id]?.name??<Skeleton />}</TableCell>
                            <TableCell><TimeView resv={resv} mobile={mobile} timeFilter={timeFilter} /></TableCell>
                            <TableCell>
                                <Box component="span" 
                                    borderBottom={3} 
                                    borderColor={statusColors[resv.status]}
                                >
                                    {resvStatus[resv.status]?.label ?? resv.status}
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Tooltip title="查看详情">
                                    <IconButton component={Link} to={`/reservations/${resv.resv_id}`}
                                        size={mobile? "small": "medium"}
                                    >
                                        <NavigateNextIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
}

export default ResvList;