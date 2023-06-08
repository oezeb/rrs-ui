import {
    Skeleton,
    Table, TableBody, TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import React from "react";

import { useAuth } from "providers/AuthProvider";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";

interface ResvTableProps {
    resv?: Record<string, any> | null;
}

function ResvTable({ resv }: ResvTableProps) {
    const { user } = useAuth();
    const [room, setRoom] = React.useState<Record<string, any> | null>(null);

    React.useEffect(() => {
        if (user === null || resv === undefined) return;
        if (resv === null) {
            setRoom(null);
        } else {
            fetch(api_paths.rooms + `?room_id=${resv.room_id}`)
                .then(res => res.json())
                .then(data => {
                    setRoom(data[0]);
                });
        }
    }, [resv, user]);

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>预约编号</TableCell>
                    <TableCell>房间</TableCell>
                    <TableCell>创建时间</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>{resv?.resv_id??<Skeleton />}</TableCell>
                    <TableCell>
                        {room ? (
                            <Link to={`/rooms/${room?.room_id}`}>
                                {room.name}
                            </Link>
                        ) : <Skeleton />}
                    </TableCell>
                    <TableCell>
                        {resv?.create_time?.format("YYYY-MM-DD HH:mm")??<Skeleton />}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}

export default ResvTable;