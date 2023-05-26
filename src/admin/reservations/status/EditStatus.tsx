import * as React from "react";
import { useSearchParams } from "react-router-dom";

import { Box, Button, List, ListItem, TextField, Typography } from "@mui/material";
import { paths as api_paths } from "utils/api";
import { descriptionFieldParams, labelFieldParams } from "utils/util";

function EditStatus() {
    const [status, setStatus] = React.useState<Record<string, any>|null>(null);
    const [searchParams] = useSearchParams();
    // const {showSnackbar} = useSnackbar();

    let id = searchParams.get('status');

    React.useEffect(() => {
        fetch(api_paths.admin.resv_status + `?status=${id}`)
            .then(res => res.json())
            .then(res => {
                setStatus(res[0]);
            });
    }, [id]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    return (<>{status &&
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h2" gutterBottom>
                编辑预约状态
            </Typography>
            <List sx={{ ml: 4 }} dense>
                <ListItem>
                    <TextField disabled variant="standard" type="number"
                        name="status" label="状态" defaultValue={status.status} />
                    <TextField {...labelFieldParams} defaultValue={status.label} sx={{ml: 1}} />
                </ListItem>
                <ListItem>
                    <TextField {...descriptionFieldParams} defaultValue={status.description} sx={{ mt: 1 }} />
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