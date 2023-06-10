import {
    Skeleton,
} from "@mui/material";
import React from "react";

import { useAuth } from "providers/AuthProvider";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import Table, { TableSkeleton } from "utils/Table";

function ResvTable({ resv } : { resv: Record<string, any>|undefined }) {
    const { user } = useAuth();
    const [room, setRoom] = React.useState<Record<string, any>|undefined>(undefined);

    React.useEffect(() => {
        if (resv === undefined) {
            setRoom(undefined);
        } else {
            fetch(api_paths.rooms + `?room_id=${resv.room_id}`)
                .then(res => res.json())
                .then(data => {
                    setRoom(data[0]);
                })
                .catch(err => console.error(err));
        }
    }, [resv, user]);

    const columns = [
        { field: "resv_id", label: "编号", noSort: true },
        { field: "room_id", label: "房间", noSort: true },
        { field: "create_time", label: "创建时间", noSort: true },
        { field: "update_time", label: "更新时间", noSort: true },
    ];

    const renderValue = (row: Record<string, any>, field: string) => {
        switch (field) {
            case "room_id":
                return room ? (
                    <Link to={`/rooms/${room?.room_id}`}>
                        {room.name}
                    </Link>
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