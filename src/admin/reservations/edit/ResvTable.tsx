import {
    FormControl,
    MenuItem,
    Select,
    Skeleton,
    Table, TableBody, TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import React from "react";

import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";

function ResvTable({ resv } : { resv: Record<string, any>|undefined }) {
    const [room, setRoom] = React.useState<Record<string, any> | null>(null);
    const [privacy, setPrivacy] = React.useState<Record<number, any>[]|undefined>(undefined);
    const [users, setUsers] = React.useState<Record<string, any>>({});

    React.useEffect(() => {
        if (resv === undefined) {
            setRoom(null);
        } else {
            fetch(api_paths.rooms + `?room_id=${resv.room_id}`)
                .then(res => res.json())
                .then(data => {
                    setRoom(data[0]);
                });
        }
    }, [resv]);

    React.useEffect(() => {
        fetch(api_paths.resv_privacy)
            .then(res => res.json())
            .then(data => {
                setPrivacy(data);
            });
        fetch(api_paths.admin.users)
            .then(res => res.json())
            .then(data => setUsers(data.reduce((acc: Record<string, any>, item: Record<string, any>) => {
                acc[item.username] = item;
                return acc;
            }, {})));
    }, []);

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    {["编号", "用户", "房间", "隐私", "创建时间", "更新时间"]
                        .map((item, index) => (<TableCell key={index}>{item}</TableCell>))}
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>{resv?.resv_id??<Skeleton />}</TableCell>
                    <TableCell>{users[resv?.username]?.name??<Skeleton />}</TableCell>
                    <TableCell>
                        {room ? (
                            <Link to={`/rooms/${room?.room_id}`}>
                                {room.name}
                            </Link>
                        ) : <Skeleton />}
                    </TableCell>
                    <TableCell>
                        {resv && privacy ? (
                            <FormControl variant="standard" size="small" >
                                <Select name="privacy" defaultValue={resv.privacy}>
                                    {privacy.map((item: any) => (
                                        <MenuItem key={item.privacy} value={item.privacy}>
                                            {item.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : <Skeleton />}
                    </TableCell>
                    <TableCell>
                        {resv?.create_time.format("YYYY-MM-DD HH:mm")??<Skeleton />}
                    </TableCell>
                    <TableCell>
                        {resv?.update_time?.format("YYYY-MM-DD HH:mm")??<Skeleton />}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}

export default ResvTable;