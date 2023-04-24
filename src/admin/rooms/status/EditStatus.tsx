import * as React from "react";
import { useSearchParams } from "react-router-dom";

import AddEditLabel, { Item } from "../AddEditLabel";
import { useSnackbar } from "../../../SnackbarProvider";

function EditStatus() {
    const [status, setStatus] = React.useState<Record<string, any>|null>(null);
    const [searchParams] = useSearchParams();
    const {showSnackbar} = useSnackbar();

    let id = searchParams.get('status');

    
    React.useEffect(() => {
        let url = `/api/admin/room_status?status=${id}`;
        fetch(url).then(res => res.json()).then(res => {
            setStatus(res[0]);
        });
    }, [id]);

    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!status) {
            return;
        }

        let form = new FormData(event.currentTarget);
        let label = form.get('label');
        let description = form.get('description');

        let data: Record<string, any> = {};
        if (label !== status.label) {
            data.label = label;
        }
        if (description !== status.description) {
            data.description = description;
        }

        if (Object.keys(data).length === 0) {
            showSnackbar({message: "未修改任何内容", severity: "warning", duration: 2000});
        } else {
            fetch('/api/admin/room_status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{
                    where: {status: status.status},
                    data: data
                }]),
            })
            .then(res => {
                if (res.ok) {
                    setStatus({...status, ...data});
                    showSnackbar({message: "修改成功", severity: "success", duration: 2000});
                } else {
                    throw new Error("修改失败");
                }
            })
            .catch(err => {
                showSnackbar({message: "修改失败", severity: "error"});
            });
        }
    };

    return (<>{status &&
        <AddEditLabel
            title="编辑房间状态"
            id={<Item name="状态" value={status.status} />}
            labelDefault={status.label}
            descriptionDefault={status.description}
            handleSubmit={handleSubmit}
        />
    }</>);
}

export default EditStatus;