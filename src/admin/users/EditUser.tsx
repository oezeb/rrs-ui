import * as React from "react";
import { useSearchParams } from "react-router-dom";

import { useSnackbar } from "../../SnackbarProvider";
import AddEditUser from "./AddEditUser";
import { paths as api_paths } from "../../api";

function EditUser() {
    const [user, setUser] = React.useState<Record<string, any>|null|undefined>(undefined);
    const [reload, setReload] = React.useState(true);
    const [searchParams] = useSearchParams();
    const {showSnackbar} = useSnackbar();

    let username = searchParams.get('username');

    React.useEffect(() => {
        if (reload) {
            fetch(api_paths.admin.users + `?username=${username}`)
                .then(res => res.json())
                .then(data => {
                    setUser(data[0]);
                })
                .catch(err => {
                    console.log(err);
                    setUser(null);
                });
            setReload(false);
        }
    }, [username, reload]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user) {
            return;
        }

        let form = new FormData(event.currentTarget);
        let name =  (form.get('name') as string).trim();
        let email = (form.get('email') as string).trim();
        let role = parseInt(form.get('role') as string);

        let data: Record<string, any> = {};
        if (name !== user.name) {
            data.name = name;
        }
        if (email !== user.email) {
            data.email = email;
        }
        if (role !== user.role) {
            data.role = role;
        }

        if (Object.keys(data).length === 0) {
            showSnackbar({message: "未修改任何内容", severity: "warning", duration: 2000});
        } else {
            fetch(api_paths.admin.users + `/${user.username}`, { 
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (res.ok) {
                    setUser(undefined)
                    setReload(true);
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

    return (<>{user &&
        <AddEditUser
            title="编辑用户"
            username={user.username}
            name={user.name}
            email={user.email}
            role={user.role}
            handleSubmit={handleSubmit}
            type="edit"
        />
    }</>);
}

export default EditUser;