import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { RoomList } from "rooms/Rooms";
import { paths as api_paths, room_status } from "utils/api";

function SelectRoom() {
    const [types, setTypes] = useState<Record<string, any>[]>([]);

    useEffect(() => {
        let url = api_paths.room_types;
        fetch(url).then((res) => res.json())
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
                高级预订
            </Typography>
            {types.map((type) => (
                <RoomList key={type.type} 
                    type={type} 
                    link={(room) => `/reservations/add/advanced/${room.room_id}`}
                    disabled={(room) => room.status !== room_status.available}
                />
            ))}
        </Box>
    );
}

export default SelectRoom;