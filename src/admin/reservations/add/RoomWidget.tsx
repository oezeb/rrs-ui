import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

import HomeRoomWidget, { RoomWidgetSkeleton } from 'home/room-widget/RoomWidget';
import { paths as api_paths } from "utils/api";

interface RoomWidgetProps {
    room_id: string|number;
    date: Dayjs;
}

function RoomWidget(props: RoomWidgetProps) {
    const { room_id, date } = props;
    const [room, setRoom] = useState<Record<string, any> | null>(null);

    useEffect(() => {
        let url = api_paths.admin.rooms + `?room_id=${room_id}`;
        fetch(url).then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => setRoom(data[0]))
            .catch((err) => console.error(err));
    }, [room_id]);

    if (room) {
        return (
            <HomeRoomWidget date={date} room={room} show_pending={true} />
        );
    } else {
        return <RoomWidgetSkeleton />;
    }
}

export default RoomWidget;