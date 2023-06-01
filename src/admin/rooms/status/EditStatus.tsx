import * as React from "react";
import { useSearchParams } from "react-router-dom";

import { Box, Button, List, ListItem, TextField, Typography } from "@mui/material";
import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths } from "utils/api";
import { descriptionFieldParams, labelFieldParams } from "utils/util";

function EditStatus() {
    const [status, setStatus] = React.useState<Record<string, any>|null>(null);
    const [searchParams] = useSearchParams();
    const {showSnackbar} = useSnackbar();

    let id = searchParams.get('status');
    
    React.useEffect(() => {
        fetch(api_paths.admin.room_status + `?status=${id}`)
            .then(res => res.json())
            .then(res => {
                setStatus(res[0]);
            });
    }, [id]);
    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!status) {
            return;
        }

        let form = new FormData(event.currentTarget);
        let label = form.get('label');
        let description = form.get('description');

        let data: Record<string, any> = {};
        if (label !== status.label) {
            data.label = label;
        }
        if (description !== status.description) {
            data.description = description;
        }

        if (Object.keys(data).length === 0) {
            showSnackbar({message: "未修改任何内容", severity: "warning", duration: 2000});
        } else {
            fetch(api_paths.admin.room_status + `/${status.status}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
                .then(res => {
                    if (res.ok) {
                        setStatus({...status, ...data});
                        showSnackbar({message: "修改成功", severity: "success", duration: 2000});
                    } else {
                        throw new Error("修改失败");
                    }
                })
                .catch(err => {
                    showSnackbar({message: "修改失败", severity: "error"});
                });
        }
    };

    return (<>{status &&
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h2" gutterBottom>
                编辑房间状态
            </Typography>
            <List sx={{ ml: 4 }} dense>
                <ListItem>
                    <TextField disabled variant="standard" type="number"
                        name="status" label="状态" defaultValue={status.status} />
                    <TextField {...labelFieldParams} sx={{ml: 1}} 
                        label="标签" defaultValue={status.label}
                    />
                </ListItem>
                <ListItem>
                    <TextField {...descriptionFieldParams} sx={{ mt: 1 }} 
                        label="描述" defaultValue={status.description}
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

export default EditStatus;