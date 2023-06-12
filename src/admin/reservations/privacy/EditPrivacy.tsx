import * as React from "react";
import { useParams } from "react-router-dom";

import { Box, Button, List, ListItem, TextField, Typography } from "@mui/material";
import { paths as api_paths } from "utils/api";
import { descriptionFieldParams, labelFieldParams } from "utils/util";
import { useSnackbar } from "providers/SnackbarProvider";

function EditPrivacy() {
    const [privacy, setPrivacy] = React.useState<Record<string, any>|null>(null);
    const params = useParams();
    const {showSnackbar} = useSnackbar();

    React.useEffect(() => {
        fetch(api_paths.admin.resv_privacy + `?privacy=${params.privacy}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(res => setPrivacy(res[0]))
            .catch(err => console.log(err));
    }, [params.privacy]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!privacy) return;

        let form = new FormData(event.currentTarget);
        let label = (form.get('label') as string).trim();
        let description = (form.get('description') as string).trim();

        let data: Record<string, any> = {};
        if (label !== privacy.label) {
            data.label = label;
        }
        if (description !== privacy.description) {
            data.description = description;
        }

        if (Object.keys(data).length === 0) {
            showSnackbar({message: "未修改任何内容", severity: "warning"});
        } else {
            fetch(api_paths.admin.resv_privacy + `/${privacy.privacy}`, { 
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (res.ok) {
                    setPrivacy({...privacy, ...data});
                    showSnackbar({message: "修改成功", severity: "success"});
                } else {
                    throw new Error();
                }
            })
            .catch(err => {
                showSnackbar({message: "修改失败", severity: "error"});
            });
        }
    };

    return (<>{privacy &&
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 700, margin: "auto" }} >
            <List dense>
                <ListItem divider sx={{ mb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        编辑预约隐私
                    </Typography>
                </ListItem>
                <ListItem>
                    <TextField disabled variant="standard" type="number"
                        name="privacy" label="隐私" defaultValue={privacy.privacy} />
                    <TextField {...labelFieldParams} sx={{ml: 1}}
                        label="标签" defaultValue={privacy.label} 
                    />
                </ListItem>
                <ListItem>
                    <TextField {...descriptionFieldParams} sx={{ mt: 1 }} 
                        label="描述" defaultValue={privacy.description}
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

export default EditPrivacy;