import * as React from "react";
import { useSearchParams } from "react-router-dom";


import { 
    Box,  
    Typography, 
    List, ListItem, Button,
} from "@mui/material";
import TextField from "@mui/material/TextField";

import { useSnackbar } from "../../../SnackbarProvider";
import { paths as api_paths } from "../../../api";
import { labelFieldParams, descriptionFieldParams } from "../../../util";

function EditRole() {
    const [role, setRole] = React.useState<Record<string, any>|null>(null);
    const [searchParams] = useSearchParams();
    const {showSnackbar} = useSnackbar();

    let id = searchParams.get('role');

    React.useEffect(() => {
        fetch(api_paths.admin.user_roles + `?role=${id}`)
            .then(res => res.json())
            .then(res => {
                setRole(res[0]);
            });
    }, [id]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!role) {
            return;
        }

        let form = new FormData(event.currentTarget);
        let label = (form.get('label') as string).trim();
        let description = (form.get('description') as string).trim();

        let data: Record<string, any> = {};
        if (label !== role.label) {
            data.label = label;
        }
        if (description !== role.description) {
            data.description = description;
        }

        if (Object.keys(data).length === 0) {
            showSnackbar({message: "未修改任何内容", severity: "warning", duration: 2000});
        } else {
            fetch(api_paths.admin.user_roles + `/${role.role}`, { 
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (res.ok) {
                    setRole({...role, ...data});
                    showSnackbar({message: "修改成功", severity: "success", duration: 2000});
                } else {
                    throw new Error("修改失败");
                }
            })
            .catch(err => {
                showSnackbar({message: err.message, severity: "error", duration: 2000});
            });
        }
    }

    return (<>{role &&
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h2" gutterBottom>
                编辑角色
            </Typography>
            <List sx={{ ml: 4 }} dense>
                <ListItem>
                    <TextField disabled variant="standard" type="number"
                        label="角色" defaultValue={role.role} />
                    <TextField {...labelFieldParams} defaultValue={role.label} sx={{ml: 1}} />
                </ListItem>
                <ListItem>
                    <TextField {...descriptionFieldParams} defaultValue={role.description} sx={{ mt: 1 }} />
                </ListItem>
                <ListItem>
                    <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
                        保存
                    </Button>
                </ListItem>
            </List>
        </Box>
    }</>);
}

export default EditRole;