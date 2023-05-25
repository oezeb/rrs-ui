
import { useEffect, useState } from "react";
import { 
    Box, 
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Skeleton, 
    Typography
} from "@mui/material";
import EventSeatIcon from '@mui/icons-material/EventSeat';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link } from "../Navigate";
import { paths as api_paths } from "../api";

function Rooms() {
    const [roomTypes, setRoomTypes] = useState<Record<string, any>[]>([]);

    useEffect(() => {
        fetch(api_paths.room_types)
            .then(res => res.json())
            .then(data => {
                setRoomTypes(data);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    return (
        <Box>
            <ListItem divider dense>
                <Typography variant="h5" component="h2" gutterBottom>
                    房间列表
                </Typography>
            </ListItem>
            {roomTypes.map((type) => (
                <RoomList key={type.type} type={type} link={(room) => `/rooms/${room.room_id}`} />
            ))}
        </Box>
    );
}

interface RoomListProps {
    type?: Record<string, any>;
    link?: (room: Record<string, any>) => string;
    onClick?: (room: Record<string, any>) => void;
    disabled?: (room: Record<string, any>) => boolean;
};
    

export function RoomList({ type, link, onClick, disabled }: RoomListProps) {
    const [rooms, setRooms] = useState<Record<string, any>[] | null>(null);

    useEffect(() => {
        let url = api_paths.rooms;
        url += type ? `?type=${type.type}` : '';
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
                                component={link ? Link : 'div'}
                                to={link?.(room)}
                                disabled={disabled?.(room)}
                                onClick={() => onClick?.(room)}
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

export default Rooms;