import * as React from "react";

import { useSnackbar } from "providers/SnackbarProvider";
import { useNavigate } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import AddEditUser from "./AddEditUser";


function AddUser() {
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        let form = new FormData(event.currentTarget);

        let data: Record<string, any> = {
            username: form.get('username'),
            password: form.get('password'),
            name: form.get('name'),
            email: form.get('email'),
            role: form.get('role')
        };

        fetch(api_paths.admin.users, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.ok) {
                    showSnackbar({message: "添加成功", severity: "success", duration: 2000});
                    navigate(`/admin/users/edit?username=${data.username}`);
                } else if (res.status === 409) {
                    showSnackbar({message: "用户名已存在", severity: "error"});
                } else {
                    throw new Error("添加失败");
                }
            })
            .catch(err => {
                console.log(err);
                showSnackbar({message: "添加失败", severity: "error"});
            });
    };

    return (<AddEditUser title="添加用户" handleSubmit={handleSubmit} type="add" />);
}

export default AddUser;