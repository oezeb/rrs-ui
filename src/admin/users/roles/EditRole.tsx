import * as React from "react";
import { useParams } from "react-router-dom";


import {
    Box,
    Button,
    List, ListItem,
    Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";

import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths } from "utils/api";
import { descriptionFieldParams, labelFieldParams } from "utils/util";

function EditRole() {
    const [role, setRole] = React.useState<Record<string, any>|null>(null);
    const params = useParams();
    const {showSnackbar} = useSnackbar();

    React.useEffect(() => {
        if (!params.role) return;
        
        fetch(api_paths.admin.user_roles + `?role=${params.role}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(res => setRole(res[0]))
            .catch(err => console.log(err));
    }, [params.role]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!role) return;

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
            showSnackbar({message: "未修改任何内容", severity: "warning"});
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
                    throw new Error();
                }
            })
            .catch(err => {
                showSnackbar({message: err.message, severity: "error"});
            });
        }
    }

    return (<>{role &&
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 700, margin: "auto" }} >
            <List dense>
                <ListItem divider sx={{ mb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        编辑角色
                    </Typography>
                </ListItem>
                <ListItem>
                    <TextField disabled variant="standard" type="number"
                        label="角色" defaultValue={role.role} />
                    <TextField {...labelFieldParams} sx={{ml: 1}}
                        label="标签" defaultValue={role.label}
                    />
                </ListItem>
                <ListItem>
                    <TextField {...descriptionFieldParams} sx={{ mt: 1 }}
                        label="描述" defaultValue={role.description}
                    />
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