import {
    FormControl,
    MenuItem,
    Select,
    Skeleton,
} from "@mui/material";
import React from "react";

import { Link } from "utils/Navigate";
import Table, { TableSkeleton } from "utils/Table";
import { paths as api_paths } from "utils/api";

function ResvTable({ resv } : { resv: Record<string, any>|undefined }) {
    const [room, setRoom] = React.useState<Record<string, any>|undefined>(undefined);
    const [privacy, setPrivacy] = React.useState<Record<number, any>[]|undefined>(undefined);
    const [users, setUsers] = React.useState<Record<string, any>>({});
    const [sessions, setSessions] = React.useState<Record<string, any>>({});

    React.useEffect(() => {
        if (resv === undefined) {
            setRoom(undefined);
        } else {
            fetch(api_paths.admin.rooms + `?room_id=${resv.room_id}`)
                .then(res => res.json())
                .then(data => {
                    setRoom(data[0]);
                })
                .catch(err => console.error(err));
        }
    }, [resv]);

    React.useEffect(() => {
        fetch(api_paths.admin.resv_privacy)
            .then(res => res.json())
            .then(data => {
                setPrivacy(data);
            })
            .catch(err => console.error(err));
        fetch(api_paths.admin.users)
            .then(res => res.json())
            .then(data => setUsers(data.reduce((acc: Record<string, any>, item: Record<string, any>) => {
                acc[item.username] = item;
                return acc;
            }, {})))
            .catch(err => console.error(err));
        fetch(api_paths.admin.sessions)
            .then(res => res.json())
            .then(data => setSessions(data.reduce((acc: Record<string, any>, item: Record<string, any>) => {
                acc[item.session_id] = item;
                return acc;
            }, {})))
            .catch(err => console.error(err));
    }, []);

    const columns = [
        { field: "resv_id", label: "编号", noSort: true },
        { field: "username", label: "用户", noSort: true },
        { field: "room_id", label: "房间", noSort: true },
        { field: "session_id", label: "会话", noSort: true },
        { field: "privacy", label: "隐私", noSort: true },
        { field: "create_time", label: "创建时间", noSort: true },
        { field: "update_time", label: "更新时间", noSort: true },
    ];

    const renderValue = (row: Record<string, any>, field: string) => {
        switch (field) {
            case "username":
                return users[row.username]?.name??<Skeleton />;
            case "room_id":
                return room ? (
                    <Link to={`/rooms/${room?.room_id}`}>
                        {room.name}
                    </Link>
                ) : <Skeleton />;
            case "session_id":
                return sessions[row.session_id]?.name;
            case "privacy":
                return privacy ? (
                    <FormControl variant="standard" size="small" >
                        <Select name="privacy" defaultValue={row.privacy}>
                            {privacy.map((item: any) => (
                                <MenuItem key={item.privacy} value={item.privacy}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : <Skeleton />;
            case "create_time":
            case "update_time":
                return row[field]?.format("YYYY-MM-DD HH:mm");
            default:
                return row[field];
        }
    };

    if (resv === undefined) {
        return <TableSkeleton
            columns={columns.map(item => item.label)}
            rowCount={1}
        />;
    }

    return (
        <Table columns={columns} rows={[resv]} getValueLabel={renderValue} />
    );
}

export default ResvTable;