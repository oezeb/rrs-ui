import * as React from "react";

import dayjs from "dayjs";
import { useSnackbar } from "providers/SnackbarProvider";
import { useNavigate } from "utils/Navigate";
import AddEditSession from "./AddEditSession";

function AddSession() {
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        let form = new FormData(event.currentTarget);

        let data: Record<string, any> = {
            name: form.get('name'),
            start_time: form.get('start_time'),
            end_time: form.get('end_time'),
        };

        if (dayjs(data.start_time).isAfter(data.end_time)) {
            showSnackbar({message: "开始时间不能晚于结束时间", severity: "error"});
            return;
        }

        let session_id = form.get('session_id');
        if (session_id !== "") {
            data.session_id = session_id;
        }

        fetch('/api/admin/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                showSnackbar({message: "添加成功", severity: "success", duration: 2000});
                navigate(`/admin/sessions/edit/${data.session_id}`);
            })
            .catch(err => {
                console.log(err);
                showSnackbar({message: "添加失败", severity: "error"});
            });
    };

    return (
        <AddEditSession
            title="添加会话"
            handleSubmit={handleSubmit}
            type="add"
        />
    );
}

export default AddSession;
