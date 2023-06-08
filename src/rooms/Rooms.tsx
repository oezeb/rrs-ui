import { useParams } from "react-router-dom";
import RoomDetails from "./RoomDetail";
import RoomList from "./RoomList";

function Rooms() {
    const { room_id } = useParams();
    
    return room_id === undefined ? (
        <RoomList 
            title="房间列表"
            link={(room) => `/rooms/${room.room_id}`} 
        />
    ) : (
        <RoomDetails 
            room_id={room_id}
        />
    );
}

export default Rooms;