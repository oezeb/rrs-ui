import React from "react";
import { useEffect, useState } from "react";
import { 
    Box, 
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Skeleton, 
    Typography
} from "@mui/material";
import EventSeatIcon from '@mui/icons-material/EventSeat';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link } from "utils/Navigate";
import { paths as api_paths, room_status } from "utils/api";
import NoContent from "utils/NoContent";

interface RoomListProps {
    title: string;
    link: (room: Record<string, any>) => string;
}

export function RoomList(props: RoomListProps) {
    const { title, link } = props;
    const [types, setTypes] = React.useState<Record<string, any>[]|undefined>(undefined);

    React.useEffect(() => {
        fetch(api_paths.room_types)
            .then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => setTypes(data))
            .catch((err) => {
                setTypes([]);
                console.log(err);
            });
    }, []);

    const Title = () => <Typography variant="h5" component="h2" gutterBottom>{title}</Typography>;

    if (types === undefined) return (
        <Box>
            <Title />
            {Array(2).fill(0).map((_, i) => (
                <RoomListByTypeSkeleton key={i} />
            ))}
        </Box>
    );

    if (types.length === 0) return (
        <Box><Title /><NoContent /></Box>
    );

    return (
        <Box>
            <Title />
            {types && types.map((type) => (
                <RoomListByType 
                    key={type.type} 
                    type={type} 
                    link={link}
                    disabled={(room) => room.status !== room_status.available}
                />
            ))}
        </Box>
    );
}

interface RoomListByTypeProps {
    type: Record<string, any>;
    link?: (room: Record<string, any>) => string;
    onClick?: (room: Record<string, any>) => void;
    disabled?: (room: Record<string, any>) => boolean;
};

function RoomListByType({ type, link, onClick, disabled }: RoomListByTypeProps) {
    const [rooms, setRooms] = useState<Record<string, any>[]|undefined>(undefined);

    useEffect(() => {
        let url = api_paths.rooms;
        url += type ? `?type=${type.type}` : '';
        fetch(url).then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => setRooms(data))
            .catch((err) => {
                console.log(err);
                setRooms([]);
            });
    }, [type]);

    if (rooms === undefined) return (
        <RoomListByTypeSkeleton type={type} />
    );

    return (
        <Box>
            <Typography variant="h5" sx={{ m: 2 }} >
                {type.label}
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

const RoomListByTypeSkeleton = ({ type }: { type?: Record<string, any> }) => (
    <Box>
        <Typography variant="h5" sx={{ m: 2 }} >
            {type?.label || <Skeleton />}
        </Typography>
        <List>
            {Array.from({length: 3}, (_, i) => (
                <ListItem key={i} divider dense>
                    <ListItemText>
                            <Skeleton />
                    </ListItemText>
                </ListItem>
            ))}
        </List>
    </Box>
);

export default RoomList;