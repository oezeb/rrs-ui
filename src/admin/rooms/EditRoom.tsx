import * as React from "react";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { useSearchParams } from "react-router-dom";

import { useSnackbar } from "../../SnackbarProvider";
import AddEditRoom, { Item } from "./AddEditRoom";
import { FileToBase64 } from "../../util";

function EditRoom() {
    const [room, setRoom] = React.useState<Record<string, any>|null>(null);
    const [type, setType] = React.useState<number|null>(null);
    const [status, setStatus] = React.useState<number|null>(null);
    const [searchParams] = useSearchParams();
    const {showSnackbar} = useSnackbar();

    let room_id = searchParams.get('room_id');

    React.useEffect(() => {
        fetch(`/api/admin/rooms?room_id=${room_id}`)
            .then(res => res.json())
            .then(data => {
                setRoom(data[0]);
            })
            .catch(err => {
                console.log(err);
            });
    }, [room_id]);

    React.useEffect(() => {
        if (room) {
            setStatus(room.status);
            setType(room.type);
        }
    }, [room]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!room) {
            return;
        }

        let form = new FormData(event.currentTarget);
        let name = form.get('name');
        let capacity = form.get('capacity');
        let image = form.get('image') as File;

        let data: Record<string, any> = {};
        if (name !== room.name) {
            data.name = name;
        }
        if (capacity !== `${room.capacity}`) {
            data.capacity = capacity;
        }
        if (status !== room.status) {
            data.status = status;
        }
        if (type !== room.type) {
            data.type = type;
        }
        if (image.name !== "" && image.size > 0) {
            data.image = image;
        } else if (room.image === null) {
            data.image = null;
        }

        if (Object.keys(data).length === 0) {
            showSnackbar({message: "未修改任何内容", severity: "warning", duration: 2000});
        } else {
            const update = async () => {
                try {
                    let res = await fetch('/api/admin/rooms', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify([{
                            where: { room_id: room.room_id },
                            data: data
                        }]),
                    });

                    if (res.ok) {
                        setRoom({...room, ...data});
                        showSnackbar({message: "修改成功", severity: "success", duration: 2000});
                    } else {
                        showSnackbar({message: "修改失败", severity: "error"});
                    }
                } catch (err) {
                    console.log(err);
                    showSnackbar({message: "修改失败", severity: "error"});
                }
            };

            if (data.image !== undefined) {
                FileToBase64(data.image, (base64) => {
                    data.image = base64;
                    update();
                });
            } else {
                update();
            }
        }
    };

    return (<>{room && 
        <AddEditRoom
            title="编辑房间"
            room_id={<Item name="房间号" value={room.room_id} />}
            nameDefault={room.name}
            capacityDefault={room.capacity}
            status={status}
            setStatus={setStatus}
            type={type}
            setType={setType}
            handleSubmit={handleSubmit}
            image={<>
                {room.image !== null && <><Tooltip title="删除图片" arrow>
                    <IconButton onClick={() => {
                        setRoom({...room, image: null});
                    }} size="small">
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
                <img src={`data:image/png;base64,${room.image}`} alt="房间图片" style={{maxWidth: 100}} /></>}
            </>}
        />
    }</>);
}

export default EditRoom;