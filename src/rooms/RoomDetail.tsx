import * as React from 'react';
import {  List, ListItem, Box, Tooltip, Skeleton } from "@mui/material";

import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { paths as api_paths } from "utils/api";
import { roomStatusColors as statusColors } from 'utils/util';

function RoomDetail({ room_id }: { room_id: string|number }) {
    const [room, setRoom] = React.useState<Record<string, any> | null>(null);
    const [roomStatus, setRoomStatus] = React.useState<Record<number, any>>({});
    const [roomTypes, setRoomTypes] = React.useState<Record<number, any>>({});

    React.useEffect(() => {
        fetch(api_paths.rooms + `?room_id=${room_id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setRoom(data[0]))
            .catch(err => console.error(err));
        }, [room_id]);
        
    React.useEffect(() => {
        fetch(api_paths.room_status)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setRoomStatus(data
                .reduce((acc: Record<number, any>, item: any) => {
                    acc[item.status] = item;
                    return acc;
                }, {})
            ))
            .catch(err => console.error(err));
        fetch(api_paths.room_types)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setRoomTypes(data
                .reduce((acc: Record<number, any>, item: any) => {
                    acc[item.type] = item;
                    return acc;
                }, {})
            ))
            .catch(err => console.error(err));
    }, []);

    const ListItemView = (props: { label: string, value: JSX.Element | string }) => (
        <ListItem dense>
            <ListItemText>
                <Box sx={{ display: 'flex' }}>
                    <Typography variant="body1" fontWeight="bold">{props.label}：</Typography>
                    <Typography component='div' variant="body1" flexGrow={1} sx={{ ml: 1 }}>
                        {props.value}
                    </Typography>
                </Box>
            </ListItemText>
        </ListItem>
    );

    return (
        <Box>
            <ListItem divider dense>
                <Typography variant="h5" component="h2" gutterBottom>
                    {room? room.name : <Skeleton />}
                </Typography>
            </ListItem>
            <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} flexWrap="wrap" justifyContent="space-between">
                {room? room.image ? (
                    <Box
                        component="img" alt="room" 
                        src={`data:image/png;base64,${room.image}`} 
                        maxWidth="100%" 
                        maxHeight={{ xs: 200, sm: 300 }}
                    />
                ) : null : (
                    <Box width="100%" height={{ xs: 200, sm: 300 }} >
                        <Skeleton variant="rectangular" width="100%" height="100%" />
                    </Box>
                )}
                <List>
                    <ListItemView
                        label="房间号"
                        value={room? room.room_id : <Skeleton />} 
                    />
                    <ListItemView 
                        label="状态"
                        value={room && roomStatus[room.status] !== undefined ? (
                            <Tooltip title={roomStatus[room.status]?.description}>
                                <Box display="inline"
                                    borderBottom={3}
                                    borderColor={statusColors[room.status]}
                                >
                                    {roomStatus[room.status]?.label ?? room.status}
                                </Box>
                            </Tooltip>
                        ) : <Skeleton />} 
                    />
                    <ListItemView 
                        label="容量"
                        value={room? room.capacity : <Skeleton />} 
                    />
                    <ListItemView 
                        label="类型"
                        value={room && roomTypes[room.type] !== undefined ? (
                            <Tooltip title={roomTypes[room.type]?.description}>
                                <Box display="inline">
                                    {roomTypes[room.type]?.label ?? room.type}
                                </Box>
                            </Tooltip>
                        ) : <Skeleton />}
                    />
                </List>
            </Box>
        </Box>
    );
}

export default RoomDetail;