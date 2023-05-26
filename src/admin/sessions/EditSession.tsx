import * as React from "react";
import { useSearchParams } from "react-router-dom";

import dayjs from "dayjs";
import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths } from "utils/api";
import AddEditSession from "./AddEditSession";

function EditSession() {
    const [session, setSession] = React.useState<Record<string, any>|null>(null);
    const [searchParams] = useSearchParams();
    const {showSnackbar} = useSnackbar();

    let session_id = searchParams.get('session_id');

    React.useEffect(() => {
        fetch(api_paths.admin.sessions + `?session_id=${session_id}`)
            .then(res => res.json())
            .then(data => {
                setSession({
                    ...data[0],
                    start_time: dayjs(data[0].start_time).format('YYYY-MM-DDTHH:mm'),
                    end_time: dayjs(data[0].end_time).format('YYYY-MM-DDTHH:mm'),
                });
            })
            .catch(err => {
                console.log(err);
            });
    }, [session_id]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!session) {
            return;
        }

        let form = new FormData(event.currentTarget);
        let name = form.get('name');

        let data: Record<string, any> = {};
        if (name !== session.name) {
            data.name = name;
        }

        if (dayjs(data.start_time).isAfter(data.end_time)) {
            showSnackbar({message: "开始时间不能晚于结束时间", severity: "error"});
            return;
        }

        if (Object.keys(data).length === 0) {
            showSnackbar({message: "未修改任何内容", severity: "warning", duration: 2000});
        } else {
            fetch(api_paths.admin.sessions + `/${session.session_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(res => {
                    if (res.ok) {
                        setSession({ ...session, ...data });
                        showSnackbar({message: "修改成功", severity: "success", duration: 2000});
                    } else {
                        throw new Error("修改失败");
                    }
                })
                .catch(err => {
                    console.log(err);
                    showSnackbar({message: "修改失败。确保时间不与其他会话重叠", severity: "error"});
                });
        }
    };

    return (<>{session && 
        <AddEditSession
            title="编辑会话"
            session_id={session.session_id}
            name={session.name}
            startTime={session.start_time}
            endTime={session.end_time}
            handleSubmit={handleSubmit}

            type="edit"
        />
    }</>);
}

export default EditSession;
