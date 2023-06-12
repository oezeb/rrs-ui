import * as React from "react";
import { useParams } from "react-router-dom";

import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths } from "utils/api";
import AddEditNotice from "./AddEditNotice";

function EditNotice() {
    const [notice, setNotice] = React.useState<Record<string, any>|null>(null);
    const [user, setUser] = React.useState<Record<string, any>|null>(null);
    const { notice_id, username } = useParams();
    const {showSnackbar} = useSnackbar();

    React.useEffect(() => {
        fetch(api_paths.admin.notices + `?notice_id=${notice_id}&username=${username}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setNotice(data[0]))
            .catch(err => console.log(err));
    }, [notice_id, username]);

    React.useEffect(() => {
        if (!notice) return;
        fetch(api_paths.admin.users + `?username=${notice.username}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setUser(data[0]))
            .catch(err => console.log(err));
    }, [notice]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !notice) return;
        const data = new FormData(event.currentTarget);
        const title = data.get("title");
        const content = data.get("content");
        let _data: Record<string, any> = {};
        if (title !== notice.title) {
            _data.title = title;
        }
        if (content !== notice.content) {
            _data.content = content;
        }

        console.log(_data);

        if (Object.keys(_data).length !== 0) {
            fetch(api_paths.admin.notices + `/${notice.notice_id}/${user.username}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(_data),
            })
                .then(res => {
                    if (res.ok) {
                        showSnackbar({message: '编辑公告成功', severity: 'success', duration: 2000});
                        setNotice({...notice, ..._data});
                    } else {
                        throw new Error('编辑公告失败');
                    }
                })
                .catch(err => {
                    showSnackbar({message: "编辑公告失败", severity: "error"});
                });
        } else {
            showSnackbar({message: "未修改任何内容", severity: "warning", duration: 2000});
        }
    };

    return (<>{notice && user &&
        <AddEditNotice
            _title="编辑公告"
            notice_id={notice.notice_id}
            user={user}
            title={notice.title}
            content={notice.content}
            handleSubmit={handleSubmit}
            type="edit"
            disabled={notice.username !== user.username}
        />
    }</>);
}

export default EditNotice;