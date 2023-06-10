import {
    Box,
    FormControl,
    InputLabel,
    ListSubheader,
    MenuItem,
    Select as MuiSelect,
    Skeleton,
} from "@mui/material";
import { useEffect, useState } from "react";

import { paths as api_paths, resv_privacy } from "utils/api";

interface SelectInfoProps {
    room?: Record<string, any>|null;
    session?: Record<string, any>|null;
    privacy?: Record<string, any>|null;
    user?: Record<string, any>|null;
    setRoom: (room: Record<string, any>|null|undefined) => void;
    setSession: (session: Record<string, any>|null|undefined) => void;
    setPrivacy: (privacy: Record<string, any>|null|undefined) => void;
    setUser: (user: Record<string, any>|null|undefined) => void;
}

function SelectInfo(props: SelectInfoProps) {
    const [users, setUsers] = useState<Record<string, any>[]|undefined>(undefined);
    const [rooms, setRooms] = useState<Record<string, any>[]|undefined>(undefined);
    const [roomTypes, setRoomTypes] = useState<Record<string, any>[]|undefined>(undefined);
    const [resvPrivacy, setResvPrivacy] = useState<Record<string, any>[]|undefined>(undefined);
    const [sessions, setSessions] = useState<Record<string, any>[]|undefined>(undefined);
    
    const { room, session, privacy, user, setRoom, setSession, setPrivacy, setUser } = props;
    
    useEffect(() => {
        const get = async (path: string, setter: (data: any) => void) => {
            try {
                let res = await fetch(path);
                let data = await res.json();
                setter(data);
            } catch (err) {
                console.log(err);
            }
        }

        let promises = [
            get(api_paths.admin.users, setUsers),
            get(api_paths.admin.rooms, setRooms),
            get(api_paths.admin.room_types, setRoomTypes),
            get(api_paths.admin.resv_privacy, setResvPrivacy),
            get(api_paths.admin.sessions, setSessions),
        ];

        Promise.all(promises);
    }, []);

    useEffect(() => {
        if (rooms === undefined || room !== undefined) return;
        if (rooms && rooms.length > 0) {
            setRoom(rooms[0]);
        } else {
            setRoom(null);
        }
    }, [rooms, room, setRoom]);

    useEffect(() => {
        if (sessions === undefined || session !== undefined) return;
        let _session: any = sessions?.find((s) => s.is_current);
        if (_session === undefined && sessions && sessions.length > 0) {
            _session = sessions[0];
        } else if (_session === undefined) {
            _session = null;
        }
        setSession(_session);
    }, [sessions, session, setSession]);

    const FormSKeleton = () => (
        <Skeleton variant="rectangular" sx={{ width: "100%", height: 40 }} />
    );

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, justifyContent: "center" }}>
            {rooms && roomTypes ? 
            <FormControl fullWidth required>
                <InputLabel>房间</InputLabel>
                <MuiSelect size="small" label="房间" value={room?.room_id??""} required>
                    {roomTypes.map((roomType) => {
                        let items = rooms.filter((room) => room.type === roomType.type).map((room) => (
                            <MenuItem key={room.room_id} value={room.room_id} onClick={() => setRoom(room)}>
                                {room.name}
                            </MenuItem>
                        ));
                        return [
                            <ListSubheader key={`subheader-${roomType.type}`}>
                                {roomType.label}
                            </ListSubheader>,
                            ...items
                        ];
                    })}
                </MuiSelect>
            </FormControl> : <FormSKeleton />}
            {sessions ?
            <FormControl fullWidth>
                <InputLabel>会话</InputLabel>
                <MuiSelect size="small" label="会话" value={session?.session_id??""}>
                    {sessions.map((session) => (
                        <MenuItem key={session.session_id} value={session.session_id} onClick={() => setSession(session)}>
                            {session.name}
                            {session.is_current ? " (当前)" : ""}
                        </MenuItem>
                    ))}
                </MuiSelect>
            </FormControl> : <FormSKeleton />}
            {resvPrivacy ?
            <FormControl fullWidth required>
                <InputLabel>隐私</InputLabel>
                <MuiSelect size="small" label="隐私" value={privacy?.privacy??resv_privacy.public} required>
                    {resvPrivacy.map((privacy) => (
                        <MenuItem key={privacy.privacy} value={privacy.privacy} onClick={() => setPrivacy(privacy)}>
                            {privacy.label}
                        </MenuItem>
                    ))}
                </MuiSelect>
            </FormControl> : <FormSKeleton />}
            {users ?
            <FormControl fullWidth>
                <InputLabel>用户</InputLabel>
                <MuiSelect size="small" label="用户" value={user?.username??""}>
                    {users.map((user) => (
                        <MenuItem key={user.username} value={user.username} onClick={() => setUser(user)}>
                            {user.name}
                        </MenuItem>
                    ))}
                </MuiSelect>
            </FormControl> : <FormSKeleton />}
        </Box>
    );
}

export default SelectInfo;