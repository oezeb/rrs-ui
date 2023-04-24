import * as React from "react";
import { useSearchParams } from "react-router-dom";

import AddEditLabel, { Item } from "../AddEditLabel";
import { useSnackbar } from "../../../SnackbarProvider";

function EditType() {
    const [type, setType] = React.useState<Record<string, any>|null>(null);
    const [searchParams] = useSearchParams();
    const {showSnackbar} = useSnackbar();

    let id = searchParams.get('type');

    React.useEffect(() => {
        let url = `/api/admin/room_types?type=${id}`;
        fetch(url).then(res => res.json()).then(res => {
            setType(res[0]);
            console.log(res[0]);
        });
    }, [id]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!type) {
            return;
        }

        let form = new FormData(event.currentTarget);
        let label = form.get('label');
        let description = form.get('description');

        let data: Record<string, any> = {};
        if (label !== type.label) {
            data.label = label;
        }
        if (description !== type.description) {
            data.description = description;
        }

        if (Object.keys(data).length === 0) {
            showSnackbar({message: "未修改任何内容", severity: "warning", duration: 2000});
        } else {
            fetch('/api/admin/room_types', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{
                    where: {type: type.type},
                    data: data
                }]),
            })
            .then(res => {
                if (res.ok) {
                    setType({...type, ...data});
                    showSnackbar({message: "修改成功", severity: "success", duration: 2000});
                } else {
                    throw new Error("修改失败");
                }
            })
            .catch(err => {
                console.log(err);
                showSnackbar({message: "修改失败", severity: "error"});
            });
        }
    };

    return (<>{type &&
        <AddEditLabel
            title="编辑房间类型"
            id={<Item name="类型" value={type.type} />}
            labelDefault={type.label}
            descriptionDefault={type.description}
            handleSubmit={handleSubmit}
        />
    }</>);
}

export default EditType;