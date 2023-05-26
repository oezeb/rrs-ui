import React from "react";
import { Box, Typography } from "@mui/material";
import { RoomList } from "rooms/Rooms";
import { room_status, paths as api_paths } from "utils/api";

function SelectRoom() {
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
                预约
            </Typography>
            {types.map((type) => (
                <RoomList key={type.type} 
                    type={type} 
                    link={(room) => `/reservations/add/${room.room_id}`}
                    disabled={(room) => room.status !== room_status.available}
                />
            ))}
        </Box>
    );
}

export default SelectRoom;