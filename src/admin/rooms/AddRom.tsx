import * as React from "react";
import TextField from "@mui/material/TextField";

import AddEditRoom, { Item } from "./AddEditRoom";
import { useSnackbar } from "../../SnackbarProvider";
import { useNavigate } from "../../Navigate";
import { FileToBase64 } from "../../util";

function AddRoom() {
    const [type, setType] = React.useState<number|null>(null);
    const [status, setStatus] = React.useState<number|null>(null);

    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let form = new FormData(event.currentTarget);

        let data: Record<string, any> = {
            name: form.get('name'),
            capacity: form.get('capacity'),
            status: status,
            type: type,
        };

        let room_id = form.get('room_id');
        if (room_id !== "") {
            data.room_id = room_id;
        }

        let image = form.get('image') as File;
        if (image && image.name !== "" && image.size > 0) {
            data.image = image;
        }

        const insert = async () => {
            try {
                let res = await fetch('/api/admin/rooms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([data])
                });

                if (res.ok) {
                    let json = await res.json();
                    showSnackbar({message: "添加成功", severity: "success", duration: 2000});
                    navigate(`/admin/rooms/edit?room_id=${json['lastrowid'][0]}`);
                } else {
                    throw new Error("添加失败");
                }
            } catch (err) {
                console.log(err);
                showSnackbar({message: "添加失败", severity: "error"});
            }
        };

        if (data.image) {
            FileToBase64(data.image, (base64) => {
                data.image = base64;
                insert();
            });
        } else {
            insert();
        }
    };
    
    return (<AddEditRoom
        title="添加房间"
        room_id={<Item name="房间号" value={<TextField
            name="room_id" type="number" variant="standard"
            InputLabelProps={{ shrink: true }}
            size="small"
            helperText="如果为空，将自动生成"
        />} />}
        status={status}
        setStatus={setStatus}
        type={type}
        setType={setType}
        handleSubmit={handleSubmit}
    />);
}

export default AddRoom;