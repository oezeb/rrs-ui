import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
    Box, 
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Skeleton, 
    Typography
} from "@mui/material";
import EventSeatIcon from '@mui/icons-material/EventSeat';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function RoomList({ type }: { type?: Record<string, any> }) {
    const [rooms, setRooms] = useState<Record<string, any>[] | null>(null);

    useEffect(() => {
        let url = '/api/rooms'
        if (type) {
            url += `?type=${type.type}`;
        }

        fetch(url).then((res) => res.json())
            .then((data) => {
                setRooms(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [type]);

    if (rooms === null) {
        return <ListSkeleton count={3} divider dense />;
    } else if (rooms.length === 0) {
        return <p>No Rooms, Come Back Later</p>;
    } else {
        return (
            <Box>
                <Typography variant="h5" sx={{ m: 2 }} >
                    {type?.label}
                </Typography>
                <List>
                    {rooms.map((room) => (
                        <ListItem key={room.room_id} divider dense>
                            <ListItemButton
                                component={Link}
                                disabled={room.status !== 1}
                                to={`/reservations/new?room_id=${room.room_id}`}
                            >
                                <ListItemText primary={room.name} />
                                <ListItemIcon>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <EventSeatIcon fontSize='inherit' sx={{ mr: 1 }} /> {room.capacity}
                                    </Box>
                                </ListItemIcon>
                                <NavigateNextIcon />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        );
    }
}

const ListItemSkeleton = ({divider, dense}: {divider?: boolean, dense?: boolean}) => (
    <ListItem divider={divider} dense={dense}>
        <ListItemText>
            <Typography >
                <Skeleton />
            </Typography>
        </ListItemText>
    </ListItem>
);

interface ListSkeletonProps {
    count: number;
    divider?: boolean;
    dense?: boolean;
};

const ListSkeleton = ({count, divider, dense}: ListSkeletonProps) => (
    <List>
        {Array.from({length: count}, (_, i) => (
            <ListItemSkeleton key={i} divider={divider} dense={dense} />
        ))}
    </List>
);

export default RoomList;