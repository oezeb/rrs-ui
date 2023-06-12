import * as React from "react";

import { useSnackbar } from "providers/SnackbarProvider";
import { useNavigate } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { fileToBase64 } from "utils/util";
import AddEditRoom from "./AddEditRoom";

function AddRoom() {
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        let form = new FormData(event.currentTarget);

        let data: Record<string, any> = {
            name: form.get('name'),
            capacity: form.get('capacity'),
            status: form.get('status'),
            type: form.get('type'),
        };

        let room_id = form.get('room_id');
        if (room_id !== "") {
            data.room_id = room_id;
        }

        let image = form.get('image') as File;
        if (image.name !== "" && image.size > 0) {
            data.image = image;
        }

        const insert = async () => {
            try {
                let res = await fetch(api_paths.admin.rooms, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });

                if (!res.ok) throw new Error(res.statusText);

                let json = await res.json();
                showSnackbar({message: "添加成功", severity: "success", duration: 2000});
                navigate(`/admin/rooms/edit/${json.room_id}`);
            } catch (err) {
                console.log(err);
                showSnackbar({message: "添加失败", severity: "error"});
            }
        };

        if (data.image) {
            fileToBase64(data.image, (base64) => {
                data.image = base64;
                insert();
            });
        } else {
            insert();
        }
    };
    
    return (<AddEditRoom
        title="添加房间"
        handleSubmit={handleSubmit}
        _type="add"
    />);
}

export default AddRoom;