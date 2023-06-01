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

interface RoomListProps {
    title: string;
    link: (room: Record<string, any>) => string;
}

export function RoomList(props: RoomListProps) {
    const { title, link } = props;
    const [types, setTypes] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        fetch(api_paths.room_types)
            .then((res) => res.json())
            .then((data) => {
                setTypes(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                {title}
            </Typography>
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

    return (
        <Box>
            <Typography variant="h5" sx={{ m: 2 }} >
                {type.label}
            </Typography>
            <List>
                {rooms && rooms.map((room) => (
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
                
                {!rooms && Array.from({length: 3}, (_, i) => (
                    <ListItem key={i} divider dense>
                        <ListItemText>
                                <Skeleton />
                        </ListItemText>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default RoomList;