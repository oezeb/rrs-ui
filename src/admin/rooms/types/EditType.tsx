import * as React from "react";
import { useParams } from "react-router-dom";

import { useSnackbar } from "providers/SnackbarProvider";
import AddEditType from "./AddEditType";
import { paths as api_paths } from "utils/api";

function EditType() {
    const [type, setType] = React.useState<Record<string, any>|null>(null);
    const params = useParams();
    const {showSnackbar} = useSnackbar();

    React.useEffect(() => {
        fetch(api_paths.admin.room_types + `?type=${params.type}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(res => setType(res[0]))
            .catch(err => console.log(err));
    }, [params.type]);

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

        console.log(data);

        if (Object.keys(data).length === 0) {
            showSnackbar({message: "未修改任何内容", severity: "warning", duration: 2000});
        } else {
            fetch(api_paths.admin.room_types + `/${type.type}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
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
        <AddEditType
            title="编辑房间类型"
            type={type.type}
            label={type.label}
            description={type.description}
            handleSubmit={handleSubmit}
            _type="edit"
        />
    }</>);
}

export default EditType;