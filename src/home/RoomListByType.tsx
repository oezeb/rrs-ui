import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Dayjs } from "dayjs";
import React from "react";
import { paths as api_paths } from "utils/api";
import { Skeleton } from '@mui/material';
import RoomWidget, { RoomWidgetSkeleton } from './room-widget/RoomWidget';

interface RoomListByTypeProps {
    date: Dayjs;
    type: Record<string, any>;
}

function RoomListByType(props: RoomListByTypeProps) {
    const { type, date } = props;
    const [rooms, setRooms] = React.useState<Record<string, any>[]|undefined>(undefined);

    React.useEffect(() => {
        let url = api_paths.rooms + `?type=${type.type}`;
        fetch(url).then((res) => res.json())
            .then((data) => {
                setRooms(data);
            })
            .catch((err) => {
                console.error(err);
                setRooms([]);
            });
    }, [type.type]);

    if (rooms === undefined) {
        return <RoomListByTypeSkeleton type={type} />;
    }

    return (
        <Box>
            <Typography>
                {type.label}
            </Typography>
            <Box display="flex" flexWrap="wrap">
                {rooms.map((room) => (
                    <RoomWidget key={room.room_id} date={date} room={room}
                        show_pending={false} resv_button />
                ))}
            </Box>
        </Box>
    );
}

export const RoomListByTypeSkeleton = ({ type }: { type?: Record<string, any> }) => (
    <Box>
        <Typography>
            {type?.label??<Skeleton />}
        </Typography>
        <Box display="flex" flexWrap="wrap">
            {Array(4).fill(0).map((_, i) => (
                <RoomWidgetSkeleton key={i} />
            ))}
        </Box>
    </Box>
);

export default RoomListByType;