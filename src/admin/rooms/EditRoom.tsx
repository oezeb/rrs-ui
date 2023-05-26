import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Tooltip } from "@mui/material";
import * as React from "react";
import { useSearchParams } from "react-router-dom";

import { BackDrop } from "utils/BackDrop";
import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths } from "utils/api";
import { FileToBase64 } from "utils/util";
import AddEditRoom from "./AddEditRoom";

function EditRoom() {
    const [room, setRoom] = React.useState<Record<string, any>|null>(null);
    const [delImage, setDelImage] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const {showSnackbar} = useSnackbar();

    let room_id = searchParams.get('room_id');

    React.useEffect(() => {
        fetch(api_paths.admin.rooms + `?room_id=${room_id}`)
            .then(res => res.json())
            .then(data => {
                setRoom(data[0]);
            })
            .catch(err => {
                console.log(err);
            });
    }, [room_id]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!room) {
            return;
        }

        let form = new FormData(event.currentTarget);
        let name = form.get('name');
        let capacity = form.get('capacity');
        let status = form.get('status');
        let type = form.get('type');
        let image = form.get('image') as File;

        let data: Record<string, any> = {};
        if (name !== room.name) {
            data.name = name;
        }
        if (capacity !== `${room.capacity}`) {
            data.capacity = capacity;
        }
        if (status !== `${room.status}`) {
            data.status = status;
        }
        if (type !== `${room.type}`) {
            data.type = type;
        }
        if (image.name !== "" && image.size > 0) {
            data.image = image;
        } else if (delImage) {
            data.image = "";
        }

        if (Object.keys(data).length === 0) {
            showSnackbar({message: "未修改任何内容", severity: "warning", duration: 2000});
        } else {
            const update = async () => {
                setLoading(true);
                try {
                    let res = await fetch(api_paths.admin.rooms + `/${room.room_id}`, {
                        method: 'PATCH',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(data)
                    });

                    if (res.ok) {
                        setRoom({...room, ...data});
                        showSnackbar({message: "修改成功", severity: "success", duration: 2000});
                    } else {
                        throw new Error("修改失败");
                    }
                } catch (err) {
                    console.log(err);
                    showSnackbar({message: "修改失败", severity: "error"});
                } finally {
                    setLoading(false);
                }
            };
            
            if (data.image !== undefined && data.image !== "") {
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
            room_id={room.room_id}
            name={room.name}
            capacity={room.capacity}
            status={room.status}
            type={room.type}
            handleSubmit={handleSubmit}
            image={<>
                {room.image && <><Tooltip title="删除图片" arrow>
                    <IconButton onClick={() => {
                        setRoom({...room, image: null});
                        setDelImage(true);
                    }} size="small">
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
                <img src={`data:image/png;base64,${room.image}`} alt="房间图片" style={{maxWidth: 100}} /></>}
            </>}
            _type="edit"
        />
    }<BackDrop open={loading} /></>);
}

export default EditRoom;