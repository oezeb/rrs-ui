import { useAuth } from "providers/AuthProvider";
import { useSnackbar } from "providers/SnackbarProvider";
import * as React from "react";
import { useNavigate } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import AddEditNotice from "./AddEditNotice";

function AddNotice() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user) return;

        const data = new FormData(event.currentTarget);
        const _notice_id = data.get("notice_id");
        const title = data.get("title");
        const content = data.get("content");

        const notice_id = _notice_id === "" ? undefined : _notice_id;

        fetch(api_paths.admin.notices, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notice_id, title, content }),
        })
            .then(res => {
                if (res.ok) {
                    showSnackbar({message: '添加公告成功', severity: 'success', duration: 2000});
                    return res.json();
                } else {
                    throw new Error('添加公告失败');
                }
            })
            .then(data => {
                navigate(`/admin/notices/edit?notice_id=${data.notice_id}&username=${user.username}`);
            })
            .catch(err => {
                showSnackbar({message: "添加公告失败", severity: "error"});
            });
    };

    return (<>
        {user &&
        <AddEditNotice
            _title="添加公告"
            handleSubmit={handleSubmit}
            type="add"
            user={user}
        />}
    </>);
}

export default AddNotice;
